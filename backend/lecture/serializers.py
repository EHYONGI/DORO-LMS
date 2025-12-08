from rest_framework import serializers
from .models import Lecture, Enrollment, Assignment, LectureNotice, Attendance, LectureRecommendation, Submission
from user.models import User


# ========================================
# 1. 기본 강의 정보 시리얼라이저
# ========================================

class LectureSerializer(serializers.ModelSerializer):
    """강의 정보 시리얼라이저 (확장됨)"""
    instructor_name = serializers.SerializerMethodField()
    
    # 커리큘럼 관련 필드
    competency_type_display = serializers.CharField(source='get_competency_type_display', read_only=True)
    level_display = serializers.CharField(source='get_level_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    
    # 선수과목 수
    prerequisite_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Lecture
        fields = [
            'id', 'name', 'instructor_name', 'status', 'status_display', 'description',
            'course_code', 'competency_type', 'competency_type_display',
            'level', 'level_display', 'required_score',
            'learning_tools', 'required_kits', 'prerequisite_count',
            'created_at'
        ]
    
    def get_instructor_name(self, obj):
        if not obj.instructor:
            return None
        full_name = f"{obj.instructor.last_name}{obj.instructor.first_name}".strip()
        return full_name if full_name else obj.instructor.username

    def get_prerequisite_count(self, obj):
        """선수과목 개수"""
        return obj.prerequisite_lectures.count()


class LectureSimpleSerializer(serializers.ModelSerializer):
    """추천 목록에서 사용할 간소화된 강의 정보"""
    instructor_name = serializers.SerializerMethodField()
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

    def get_instructor_name(self, obj):
        if not obj.instructor:
            return None
        full_name = f"{obj.instructor.last_name}{obj.instructor.first_name}".strip()
        return full_name if full_name else obj.instructor.username


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
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        return obj.get_recommendation_score(request.user)
    
    def get_user_recommendation_reason(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return None
        from .services import LectureRecommendationService
        score = obj.get_recommendation_score(request.user)
        return LectureRecommendationService._generate_reason(request.user, obj, score)
    
    def get_is_eligible(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated:
            return True
        return obj.is_eligible_for_user(request.user)


# ... (중간 생략: LectureRecommendationSerializer 등은 변경 없음) ...
# 기존 코드 유지: LectureRecommendationSerializer, LectureRecommendationResponseSerializer, EnrollmentSerializer, EnrollmentCreateSerializer, AssignmentSerializer


# ========================================
# 5. 강의 공지 시리얼라이저
# ========================================

class LectureNoticeSerializer(serializers.ModelSerializer):
    """강의 공지 시리얼라이저"""
    content = serializers.CharField(source='body') 
    lecture_name = serializers.ReadOnlyField(source='lecture.name')
    author_name = serializers.SerializerMethodField()
    
    class Meta:
        model = LectureNotice
        fields = ['id', 'title', 'content', 'created_at', 'lecture_name', 'author_name', 'lecture']

    def get_author_name(self, obj):
        # 강의 공지는 강사가 작성 (lecture.instructor)
        instructor = obj.lecture.instructor
        if not instructor:
            return '관리자'
        full_name = f"{instructor.last_name}{instructor.first_name}".strip()
        return full_name if full_name else instructor.username


# ... (이하 나머지 Serializer들은 기존 유지) ...
# AttendanceSerializer, AttendanceDetailSerializer, StudentSerializer, UserCompetencySerializer, SubmissionSerializer는 변경 필요 없음 (SubmissionSerializer는 이미 실명 로직 적용됨)

# (참고) 다른 Serializer들이 누락되지 않도록 필요한 부분은 유지합니다.
class LectureRecommendationSerializer(serializers.ModelSerializer):
    lecture = LectureSimpleSerializer(read_only=True)
    lecture_id = serializers.IntegerField(write_only=True)
    is_enrolled = serializers.SerializerMethodField()
    is_in_wishlist = serializers.SerializerMethodField()
    class Meta:
        model = LectureRecommendation
        fields = ['id', 'lecture', 'lecture_id', 'recommendation_score', 'reason', 'is_enrolled', 'is_in_wishlist', 'created_at']
    def get_is_enrolled(self, obj):
        request = self.context.get('request')
        if not request or not request.user.is_authenticated: return False
        return Enrollment.objects.filter(student=request.user, lecture=obj.lecture).exists()
    def get_is_in_wishlist(self, obj):
        from .models import Wishlist
        request = self.context.get('request')
        if not request or not request.user.is_authenticated: return False
        return Wishlist.objects.filter(user=request.user, lecture=obj.lecture).exists()

class LectureRecommendationResponseSerializer(serializers.Serializer):
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

class EnrollmentSerializer(serializers.ModelSerializer):
    lecture = LectureSerializer(read_only=True)
    class Meta:
        model = Enrollment
        fields = ['id', 'lecture', 'joined_at']

class EnrollmentCreateSerializer(serializers.ModelSerializer):
    lecture_id = serializers.IntegerField(write_only=True)
    class Meta:
        model = Enrollment
        fields = ['lecture_id']
    def validate_lecture_id(self, value):
        try: lecture = Lecture.objects.get(id=value)
        except Lecture.DoesNotExist: raise serializers.ValidationError("존재하지 않는 강의입니다.")
        if lecture.status not in ['OPEN', 'RECRUITING']: raise serializers.ValidationError("수강 신청이 불가능한 강의입니다.")
        user = self.context['request'].user
        if not lecture.is_eligible_for_user(user): raise serializers.ValidationError(f"이 강의는 최소 {lecture.required_score}점의 {lecture.get_competency_type_display()} 역량이 필요합니다.")
        if Enrollment.objects.filter(student=user, lecture=lecture).exists(): raise serializers.ValidationError("이미 수강 중인 강의입니다.")
        return value
    def create(self, validated_data):
        lecture_id = validated_data.pop('lecture_id')
        lecture = Lecture.objects.get(id=lecture_id)
        return Enrollment.objects.create(student=self.context['request'].user, lecture=lecture)

class AssignmentSerializer(serializers.ModelSerializer):
    lecture_name = serializers.ReadOnlyField(source='lecture.name')
    deadline = serializers.DateTimeField(source='due_date')
    content = serializers.CharField(source='description')
    class Meta:
        model = Assignment
        fields = ['id', 'lecture_name', 'title', 'deadline', 'content', 'created_at']

class AttendanceSerializer(serializers.ModelSerializer):
    status = serializers.CharField(source='get_status_display', read_only=True)
    class Meta:
        model = Attendance
        fields = ['id', 'week', 'attendance_date', 'status']

class AttendanceDetailSerializer(serializers.ModelSerializer):
    student_name = serializers.CharField(source='user.get_full_name', read_only=True)
    student_username = serializers.CharField(source='user.username', read_only=True)
    class Meta:
        model = Attendance
        fields = ['id', 'user', 'student_name', 'student_username', 'lecture', 'week', 'status', 'attendance_date']

class StudentSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'first_name', 'last_name', 'email']

class UserCompetencySerializer(serializers.Serializer):
    digital_score = serializers.IntegerField(min_value=0, max_value=100)
    ai_score = serializers.IntegerField(min_value=0, max_value=100)
    making_score = serializers.IntegerField(min_value=0, max_value=100)
    computing_score = serializers.IntegerField(min_value=0, max_value=100)
    def to_representation(self, instance):
        return {
            'digital_score': instance.digital_score,
            'ai_score': instance.ai_score,
            'making_score': instance.making_score,
            'computing_score': instance.computing_score,
        }

class SubmissionSerializer(serializers.ModelSerializer):
    student_name = serializers.SerializerMethodField()
    class Meta:
        model = Submission
        fields = ['id', 'student_name', 'content', 'file', 'submitted_at', 'grade', 'feedback', 'graded_at']
    def get_student_name(self, obj):
        full_name = f"{obj.student.last_name}{obj.student.first_name}".strip()
        return full_name if full_name else obj.student.username