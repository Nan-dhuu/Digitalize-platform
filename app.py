from flask import Flask, render_template

app = Flask(__name__)

@app.route("/")
def login():
    return render_template("login.html")

@app.route("/register")
def register():
    return render_template("register.html")

@app.route("/dashboard")
def dashboard():
    return render_template("dashboard.html")

@app.route("/students")
def students():
    return render_template("students.html")

@app.route("/courses")
def courses():
    return render_template("courses.html")

@app.route("/subjects")
def subjects():
    return render_template("subjects.html")


if __name__ == "__main__":
    app.run(debug=True)