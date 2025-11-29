# backend/lecture/serializers.py
from rest_framework import serializers
from .models import Lecture, Enrollment, Assignment, LectureNotice, Attendance, LectureRecommendation


# 1. 강의 정보 시리얼라이저 (확장됨)
class LectureSerializer(serializers.ModelSerializer):
    instructor_name = serializers.ReadOnlyField(source='instructor.username')
    
    # [추가] 커리큘럼 관련 필드
    competency_type_display = serializers.CharField(source='get_competency_type_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # [추가] 선수과목 수
    prerequisite_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'name', 'instructor_name', 'status', 'status_display', 'description',
            # 추가된 커리큘럼 필드
            'course_code', 'competency_type', 'competency_type_display',
            'level', 'level_display', 'required_score',
            'learning_tools', 'required_kits', 'prerequisite_count',
            'created_at'
        ]
    
    def get_prerequisite_count(self, obj):
        """선수과목 개수"""
        return obj.prerequisite_lectures.count()


# [추가] 간단한 강의 정보 (추천용)
class LectureSimpleSerializer(serializers.ModelSerializer):
    """추천 목록에서 사용할 간소화된 강의 정보"""
    instructor_name = serializers.CharField(source='instructor.username', read_only=True)
    competency_type_display = serializers.CharField(source='get_competency_type_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'name', 'course_code', 'description',
            'competency_type', 'competency_type_display',
            'level', 'level_display', 'required_score',
            'instructor_name', 'status'
        ]


# [추가] 강의 추천 시리얼라이저
class LectureRecommendationSerializer(serializers.ModelSerializer):
    """강의 추천 정보"""
    lecture = LectureSimpleSerializer(read_only=True)
    lecture_id = serializers.IntegerField(write_only=True)
    
    # 추가 정보
    is_enrolled = serializers.SerializerMethodField()
    is_in_wishlist = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureRecommendation
        fields = [
            'id', 'lecture', 'lecture_id',
            'recommendation_score', 'reason',
            'is_enrolled', 'is_in_wishlist',
            'created_at'
        ]
    
    def get_is_enrolled(self, obj):
        """이미 수강 중인지 확인"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Enrollment.objects.filter(
            student=request.user,
            lecture=obj.lecture
        ).exists()
    
    def get_is_in_wishlist(self, obj):
        """위시리스트에 있는지 확인"""
        from .models import Wishlist
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return False
        return Wishlist.objects.filter(
            user=request.user,
            lecture=obj.lecture
        ).exists()


# [추가] 강의 추천 생성용 (실시간 추천 응답)
class LectureRecommendationResponseSerializer(serializers.Serializer):
    """실시간 추천 응답용 Serializer (모델 없이 사용)"""
    lecture_id = serializers.IntegerField()
    lecture_name = serializers.CharField()
    course_code = serializers.CharField(allow_null=True)
    competency_type = serializers.CharField(allow_null=True)
    competency_type_display = serializers.CharField(allow_null=True)
    level = serializers.CharField()
    level_display = serializers.CharField()
    required_score = serializers.IntegerField()
    instructor_name = serializers.CharField(allow_null=True)
    match_score = serializers.FloatField()
    reason = serializers.CharField()
    is_enrolled = serializers.BooleanField(default=False)
    is_in_wishlist = serializers.BooleanField(default=False)


# 2. 수강 내역 시리얼라이저 (기존 유지)
class EnrollmentSerializer(serializers.ModelSerializer):
    lecture = LectureSerializer(read_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['id', 'lecture', 'joined_at']


# [추가] 수강 신청용 Serializer
class EnrollmentCreateSerializer(serializers.ModelSerializer):
    """수강 신청 생성용"""
    lecture_id = serializers.IntegerField(write_only=True)
    
    class Meta:
        model = Enrollment
        fields = ['lecture_id']
    
    def validate_lecture_id(self, value):
        """강의 유효성 검증"""
        try:
            lecture = Lecture.objects.get(id=value)
        except Lecture.DoesNotExist:
            raise serializers.ValidationError("존재하지 않는 강의입니다.")
        
        # 수강 신청 가능 상태 확인
        if lecture.status not in ['OPEN', 'RECRUITING']:
            raise serializers.ValidationError("수강 신청이 불가능한 강의입니다.")
        
        # 역량 점수 확인
        user = self.context['request'].user
        if not lecture.is_eligible_for_user(user):
            raise serializers.ValidationError(
                f"이 강의는 최소 {lecture.required_score}점의 "
                f"{lecture.get_competency_type_display()} 역량이 필요합니다."
            )
        
        # 중복 수강 확인
        if Enrollment.objects.filter(student=user, lecture=lecture).exists():
            raise serializers.ValidationError("이미 수강 중인 강의입니다.")
        
        return value
    
    def create(self, validated_data):
        lecture_id = validated_data.pop('lecture_id')
        lecture = Lecture.objects.get(id=lecture_id)
        
        return Enrollment.objects.create(
            student=self.context['request'].user,
            lecture=lecture
        )


# 3. 과제 시리얼라이저 (기존 유지)
class AssignmentSerializer(serializers.ModelSerializer):
    lecture_name = serializers.ReadOnlyField(source='lecture.name')
    
    class Meta:
        model = Assignment
        fields = ['id', 'lecture_name', 'title', 'deadline', 'content']


# 4. 강의 공지 시리얼라이저 (기존 유지)
class LectureNoticeSerializer(serializers.ModelSerializer):
    content = serializers.CharField(source='body') 
    lecture_name = serializers.ReadOnlyField(source='lecture.name')
    author_name = serializers.ReadOnlyField(source='lecture.instructor.username')
    
    class Meta:
        model = LectureNotice
        fields = ['id', 'title', 'content', 'created_at', 'lecture_name', 'author_name', 'lecture']


# 5. 출결 시리얼라이저 (기존 유지)
class AttendanceSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display', read_only=True)
    
    class Meta:
        model = Attendance
        fields = ['id', 'week', 'attendance_date', 'status']


# [추가] 사용자 역량 정보 Serializer
class UserCompetencySerializer(serializers.Serializer):
    """사용자 역량 점수"""
    digital_score = serializers.IntegerField(min_value=0, max_value=100)
    ai_score = serializers.IntegerField(min_value=0, max_value=100)
    making_score = serializers.IntegerField(min_value=0, max_value=100)
    computing_score = serializers.IntegerField(min_value=0, max_value=100)
    
    def to_representation(self, instance):
        """User 모델을 역량 점수 딕셔너리로 변환"""
        return {
            'digital_score': instance.digital_score,
            'ai_score': instance.ai_score,
            'making_score': instance.making_score,
            'computing_score': instance.computing_score,
        }


# [추가] 강의 상세 + 추천 정보
class LectureDetailSerializer(LectureSerializer):
    """강의 상세 정보 (추천 점수 포함)"""
    user_recommendation_score = serializers.SerializerMethodField()
    user_recommendation_reason = serializers.SerializerMethodField()
    is_eligible = serializers.SerializerMethodField()
    prerequisite_lectures = LectureSimpleSerializer(many=True, read_only=True)
    
    class Meta(LectureSerializer.Meta):
        fields = LectureSerializer.Meta.fields + [
            'user_recommendation_score',
            'user_recommendation_reason',
            'is_eligible',
            'prerequisite_lectures'
        ]
    
    def get_user_recommendation_score(self, obj):
        """현재 사용자에 대한 추천 점수"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        return obj.get_recommendation_score(request.user)
    
    def get_user_recommendation_reason(self, obj):
        """추천 이유"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        
        from .services import LectureRecommendationService
        score = obj.get_recommendation_score(request.user)
        return LectureRecommendationService._generate_reason(request.user, obj, score)
    
    def get_is_eligible(self, obj):
        """수강 자격 여부"""
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
        return obj.is_eligible_for_user(request.user)
