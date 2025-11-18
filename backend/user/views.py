from django.shortcuts import render
from django.http import HttpResponse
from rest_framework.decorators import api_view
from rest_framework.response import Response
from django.http import JsonResponse



# Create your views here.
def practice(request):
    return HttpResponse("user")

@api_view(['POST'])
def login_api(request):
    username = request.data.get('username')
    password = request.data.get('password')

    print(f"로그인 요청: {username} / {password}") # 터미널 확인용

    if username == 'admin' and password == '1234':
        return Response({"message": "로그인 성공!", "user": username}, status=200)
    else:
        return Response({"error": "아이디/비번 오류"}, status=401)