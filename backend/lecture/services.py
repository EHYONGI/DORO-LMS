# backend/lecture/services.py
from typing import List, Dict
from django.db.models import Q
from .models import Lecture, LectureRecommendation, Enrollment
from user.models import User


class LectureRecommendationService:
    """강의 추천 서비스"""
    
    # 난이도별 최소 점수 기준
    LEVEL_THRESHOLDS = {
        'common': 0,
        'basic': 40,
        'intermediate': 60,
        'advanced': 80,
    }
    
    @classmethod
    def get_recommendations(cls, user: User, limit: int = 10) -> List[Dict]:
        """사용자에게 강의 추천"""
        if user.role != 1:  # Student만 추천
            return []
        
        # 이미 수강 중이거나 완료한 강의 제외
        enrolled_lecture_ids = Enrollment.objects.filter(
            student=user
        ).values_list('lecture_id', flat=True)
        
        # 수강 가능한 강의 필터링
        available_lectures = Lecture.objects.filter(
            Q(status='OPEN') | Q(status='RECRUITING')
        ).exclude(id__in=enrolled_lecture_ids)
        
        recommendations = []
        
        for lecture in available_lectures:
            # 자격 확인
            if not lecture.is_eligible_for_user(user):
                continue
            
            # 선수과목 확인
            if not cls._check_prerequisites(user, lecture):
                continue
            
            # 추천 점수 계산
            score = lecture.get_recommendation_score(user)
            reason = cls._generate_reason(user, lecture, score)
            
            recommendations.append({
                'lecture': lecture,
                'score': score,
                'reason': reason,
            })
        
        # 점수 순 정렬
        recommendations.sort(key=lambda x: x['score'], reverse=True)
        return recommendations[:limit]
    
    @classmethod
    def _check_prerequisites(cls, user: User, lecture: Lecture) -> bool:
        """선수과목 이수 확인"""
        prerequisites = lecture.prerequisite_lectures.all()
        if not prerequisites:
            return True
        
        completed_lecture_ids = Enrollment.objects.filter(
            student=user,
            lecture__in=prerequisites
        ).values_list('lecture_id', flat=True)
        
        return set(prerequisites.values_list('id', flat=True)).issubset(
            set(completed_lecture_ids)
        )
    
    @classmethod
    def _generate_reason(cls, user: User, lecture: Lecture, score: float) -> str:
        """추천 이유 생성"""
        if not lecture.competency_type:
            return "모든 학생에게 열린 강의입니다."
        
        competency_names = {
            'D': '디지털',
            'I': '인공지능',
            'M': '메이킹',
            'C': '컴퓨팅',
        }
        
        user_score = user.get_competency_scores()[lecture.competency_type]
        required = lecture.required_score
        excess = user_score - required
        
        comp_name = competency_names[lecture.competency_type]
        
        if excess >= 20:
            return f"{comp_name} 역량({user_score}점)이 매우 높아 여유있게 수강 가능합니다."
        elif excess >= 10:
            return f"{comp_name} 역량({user_score}점)이 충분하여 추천합니다."
        else:
            return f"{comp_name} 역량 기준(최소 {required}점)을 만족합니다."
    
    @classmethod
    def save_recommendations(cls, user: User):
        """추천 결과를 DB에 저장"""
        recommendations = cls.get_recommendations(user, limit=20)
        
        # 기존 추천 삭제
        LectureRecommendation.objects.filter(user=user).delete()
        
        # 새 추천 저장
        for rec in recommendations:
            LectureRecommendation.objects.create(
                user=user,
                lecture=rec['lecture'],
                recommendation_score=rec['score'],
                reason=rec['reason']
            )
