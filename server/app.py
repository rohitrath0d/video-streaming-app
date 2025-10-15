from flask import Flask

app = Flask(__name__)

@app.route('/')
def hello_world():
  return '<p>Hello from video streaming backend. up and running!!</p>'

# __name__ will be set to '__main__', indicating that this file is the main program being executed.
if __name__ == '__main__':
  app.run(debug=True)     # debug=True enables auto-reloading and helpful error pages