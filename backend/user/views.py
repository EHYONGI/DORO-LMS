from django.core.mail import send_mail
from django.conf import settings
from .utils import generate_random_password
from django.contrib.auth import authenticate, get_user_model
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response
from rest_framework import status
from .serializers import UserSignupSerializer, UserProfileSerializer, PasswordResetSerializer
from rest_framework_simplejwt.tokens import RefreshToken

User = get_user_model()

# === 1. 인증 (Auth) ===

@api_view(['POST'])
@permission_classes([AllowAny])
def signup_api(request):
    """회원가입"""
    serializer = UserSignupSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        return Response({
            "message": "회원가입 성공!",
            "user": UserProfileSerializer(user).data
        }, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([AllowAny])
def login_api(request):
    """로그인"""
    username = request.data.get('username')
    password = request.data.get('password')

    user = authenticate(username=username, password=password)

    if user is not None:
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        return Response({
            "message": "로그인 성공",
            "user": UserProfileSerializer(user).data,
            "token": {
                "access": access_token,  # 출입증 (API 요청용)
                "refresh": str(refresh), # 재발급권 (나중에 사용)
            }
        }, status=status.HTTP_200_OK)
    else:
        return Response({"error": "아이디 또는 비밀번호가 일치하지 않습니다."}, status=status.HTTP_401_UNAUTHORIZED)


@api_view(['POST'])
@permission_classes([AllowAny])
def logout_api(request):
    """로그아웃"""
    # 현재는 JWT가 아닌 로컬 스토리지 방식이므로 서버에서는 성공 메시지만 줍니다.
    # 프론트엔드에서 로컬 스토리지 비우는 게 핵심입니다.
    return Response({"message": "로그아웃 되었습니다."}, status=status.HTTP_200_OK)


@api_view(['DELETE'])
def withdraw_api(request):
    """회원탈퇴"""
    # 실제 서비스에선 request.user를 써야 하지만, 테스트 편의를 위해 username을 받아서 처리할 수도 있습니다.
    # 여기서는 request.user를 사용하는 정석 방법으로 작성합니다.
    if not request.user.is_authenticated:
        return Response({"error": "로그인이 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)
    
    request.user.delete()
    return Response({"message": "회원 탈퇴가 완료되었습니다."}, status=status.HTTP_204_NO_CONTENT)


@api_view(['POST'])
@permission_classes([AllowAny])
def find_pw_api(request):
    """비밀번호 찾기 (임시 비밀번호 발급 및 이메일 전송)"""
    serializer = PasswordResetSerializer(data=request.data)
    
    if serializer.is_valid():
        email = serializer.validated_data['email']
        
        try:
            # 1. 유저 찾기
            user = User.objects.get(email=email)
            
            # 2. 임시 비밀번호 생성
            temp_password = generate_random_password()
            
            # 3. 유저 비밀번호 업데이트 (암호화 저장)
            user.set_password(temp_password)
            user.save()
            
            # 4. 이메일 전송
            subject = "[DORO] 임시 비밀번호 발급 안내"
            message = f"회원님의 임시 비밀번호는 [{temp_password}] 입니다.\n로그인 후 반드시 비밀번호를 변경해주세요."
            from_email = settings.EMAIL_HOST_USER if hasattr(settings, 'EMAIL_HOST_USER') else 'admin@doro.com'
            
            send_mail(subject, message, from_email, [email], fail_silently=False)
            
            return Response({"message": f"{email}로 임시 비밀번호를 전송했습니다."}, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            # 보안상 "없는 이메일입니다"라고 알려주기보다 전송된 척 하는 게 좋을 수도 있지만,
            # 지금은 명확한 에러 메시지를 줍니다.
            return Response({"error": "가입되지 않은 이메일입니다."}, status=status.HTTP_404_NOT_FOUND)
            
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


# === 2. 마이페이지 (My Page) ===

@api_view(['GET', 'PUT'])
def user_profile_api(request):
    """내 정보 조회(GET) 및 수정(PUT)"""
    
    # 테스트: 로그인 안 된 상태면 에러
    if not request.user.is_authenticated:
        # 개발 단계 편의를 위해 임시로 admin 유저 정보를 리턴할 수도 있으나,
        # 정석대로 401을 리턴합니다. (Postman 테스트 시 Header에 토큰 필요)
        return Response({"error": "로그인이 필요합니다."}, status=status.HTTP_401_UNAUTHORIZED)

    user = request.user

    if request.method == 'GET':
        serializer = UserProfileSerializer(user)
        return Response(serializer.data)

    elif request.method == 'PUT':
        serializer = UserProfileSerializer(user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response({
                "message": "정보가 수정되었습니다.",
                "user": serializer.data
            })
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
def user_overview_api(request):
    """통계"""
    data = {
        "username": str(request.user),
        "completed_courses": 5,
        "in_progress": 2,
        "average_score": 95.5
    }
    return Response(data, status=status.HTTP_200_OK)