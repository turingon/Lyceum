FROM python:3.13 

workdir /app 

copy requirements.txt .

run pip install --no-cache-dir -r requirements.txt 

copy . /app

cmd ["python","main.py"] 
