/* IMPORTANT!!!
*  npm run json:server
*/


// Create APP 
var app = angular.module("myApp", ["ngRoute", "ngCookies"]);

// Loading Page
app.config(function ($routeProvider) {
  $routeProvider
    .when('/', {
      templateUrl: 'page/home.html'
    })
    .when('/about', {
      templateUrl: 'page/about.html'
    })
    .when('/contact', {
      templateUrl: 'page/contact.html'
    })
    .when('/category', {
      templateUrl: 'subject/category.html',
      controller: 'subjectCtrl'
    })
    .when('/signin', {
      templateUrl: 'students/signin.html',
      controller: 'loginCtrl'
    })
    .when('/signup', {
      templateUrl: 'students/signup.html',
      controller: 'registerCtrl'
    })
    .when('/quiz/:id/:name', {
      templateUrl: 'quiz/quiz.html',
      controller: 'quizCtrl'
    })
    .when('/infor/:id', {
      templateUrl: 'students/infor.html',
      controller: 'changeCtrl'
    })
    .when('/forgot', {
      templateUrl: 'students/forgot.html',
      controller: 'forgotCtrl'
    })
    .when('/password/:id', {
      templateUrl: 'students/password.html',
      controller: 'changePassCtrl'
    })
    .when('/list', {
      templateUrl: 'students/list.html',
      controller: 'listCtrl'
    })
    .when('/history/:id', {
      templateUrl: 'students/history.html',
      controller: 'listMarkCtrl'
    })
    .otherwise({
      redirectTo: '/'
    });
});

app.run(function ($rootScope) {
  $rootScope.$on('$routeChangeStart', function () {
    $rootScope.loading = true;
  });
  $rootScope.$on('$routeChangeSuccess', function () {
    $rootScope.loading = false;
  });
  $rootScope.$on('$routeChangeError', function () {
    $rootScope.loading = false;
    alert("Lỗi");
  });
});

// Countdown
app.controller('timeCtrl', function ($scope, $timeout) {

  // Đặt giới hạn thời gian là 600 giây tương đương 10 phút
  $scope.counter = 600;
  
  $scope.onTimeout = function() {

    // Nếu thời gian > 0 thì bắt đầu đếm ngược, giảm dần theo từng giây một
    if ($scope.counter > 0) {
      $scope.counter--;
      mytimeout = $timeout($scope.onTimeout, 1000);
    }
    // Nếu thời gian bẳng 0 thì kết thúc bài  thi
    else {
      $scope.quizOver = true;
    }

  }
  var mytimeout = $timeout($scope.onTimeout, 1000);
});

// Tạo bộ định dạng từ số chuyển sang Date Time.
app.filter('secondsToDateTime', [function () {
  return function (seconds) {
    return new Date(1970, 0, 1).setSeconds(seconds);
  };
}]);


// Controller

// Subject Controller
app.controller("subjectCtrl", function ($scope, $http, $cookies) {

  // Lấy dữ liệu người dùng đang đăng nhập từ Cookies
  $scope.user = $cookies.getObject("user");

  /*  Check quyền truy cập khóa học thông qua Cookies
  *   Xác định đã đăng nhập chưa? nếu rồi thì được phép tham gia
  *   Nếu không thì chuyển hướng đến trang đăng nhập
  */
  if ($scope.user == null) {
    alert("Vui lòng đăng nhập để tham gia");
    window.location.href = "index.html#!signin";
  }

  // Tạo giá trị ban đầu list_subject là một mảng
  $scope.list_subject = [];

  /* Dùng phương thức get để lấy dữ liệu từ file Subjects.js ra
  * Gán dữ liệu lấy được vào biến list_subject
  */
  $http.get('../../Assignment/db/Subjects.js').then(function (res) {
    $scope.list_subject = res.data;
  });

  // Phân trang cho các khóa học
  /*
  * Đặt giá trị ban đầu của trang là 0
  * Số khóa học trên mỗi trang là 4
  * Đếm tổng các trang biết độ dài mảng chia sô khóa học trên trang.
  */
  $scope.begin = 0;
  $scope.pageSize = 4;
  $scope.pageCount = Math.ceil($scope.list_subject.length / $scope.pageSize);

  // Trang đầu tiên
  $scope.first = function () {
    $scope.begin = 0;
  }

  // Lùi một trang
  $scope.prev = function () {
    $scope.pageCount = Math.ceil($scope.list_subject.length / $scope.pageSize);
    if ($scope.begin > 0) {
      $scope.begin -= $scope.pageSize;
    }
  }

  // Tiến một trang
  $scope.next = function () {
    $scope.pageCount = Math.ceil($scope.list_subject.length / $scope.pageSize);
    if ($scope.begin < ($scope.pageCount - 1) * $scope.pageSize) {
      $scope.begin += $scope.pageSize;
    }
  }

  // Trang cuối cùng
  $scope.last = function () {
    $scope.begin = ($scope.pageCount - 1) * $scope.pageSize;
  }
});

/* Quiz Controller 
* Lấy dữ liệu quiz từ các file theo ID
* ID được lấy thông RouteParam 
*/
app.controller("quizCtrl", function ($scope, $http, $routeParams, quizFactory) {
  $http.get('../../Assignment/db/Quizs/' + $routeParams.id + '.js').then(function (res) {
    quizFactory.questions = res.data;
  });
});

/* Login Controller
* Lấy dữ liệu tất cả người dùng trên hệ thống
* Tạo một biến đếm độ dài mảng
* Dùng vòng lặp để so sánh dữ liệu người dùng đăng nhập với dữ liệu trong mảng
* Nếu khớp thì được phép đăng nhập và lưu nó vào Cookies
*/
app.controller("loginCtrl", function ($scope, $http, $cookies) {
  $http.get('../../Assignment/dbStudents.json').then(function (res) {
    $scope.users = res.data;
    $scope.users.students.length;
    $scope.login = function () {
      for (var i = 0; i < $scope.users.students.length; i++) {
        if ($scope.users.students[i].username == $scope.username && $scope.users.students[i].password == $scope.password) {
          window.location.href = "index.html";
          $cookies.putObject("user", $scope.users.students[i]);
        }
      }
    }
  });
});


/* Register Controller
* Sử dụng phương thức POST để thêm dữ liệu
* Đường dẫn được tạo từ JSON SERVER
* Khi người dùng nhập dữ liệu từ form và nhấn đăng ký
* Dữ liệu sẽ được thêm vào file Json.
*/
app.controller('registerCtrl', function ($scope, $http) {
  // $scope.users = {};
  $scope.addUser = function () {
    $http.post('http://localhost:3000/students', {
      username: $scope.users.username,
      password: $scope.users.password,
      fullname: $scope.users.fullname,
      email: $scope.users.email,
      gender: $scope.users.gender,
      birthday: $scope.users.birthday,
      schoolfee: $scope.users.schoolfee,
      marks: "0"
    })
      .then(function (response) {
        // $location.path('/');
        alert("Đăng ký thành công");
      })
      .catch(function (error) {
        $scope.errorMessage = "Add Failed!";
        // $location.path('/');
        alert("Đăng ký thất bai")
      });
  }
});

/* Change Infor Controller
* Lấy thông tin người dùng hiện tại thông qua ID
* Sử dụng phương thức POST để đổi thông tin 
* Dữ liệu được lấy thông qua các ng-model trong form
*/
app.controller("changeCtrl", function ($scope, $http, $routeParams) {

  $scope.students = {};

  $http.get('http://localhost:3000/students/' + $routeParams.id).then(function (res) {
    $scope.user = res.data;
  });

  $scope.change = function () {
    $http.patch('http://localhost:3000/students/' + $routeParams.id, {
      username: $scope.username,
      password: $scope.password,
      fullname: $scope.fullname,
      email: $scope.email,
      schoolfee: $scope.schoolfee
    })
      .then(function (res) {
        $scope.msg = "Success";
        alert($scope.msg);
      })
      .catch(function (error) {
        $scope.errorMessage = "Update Failed!";
        alert($scope.errorMessage);
      });
  }

});

/* Change Password Controller 
* Cách thức hoạt động tương tự với đổi thông tin
* Điều kiện để đổi mật khẩu là phải nhập đúng mật khẩu hiện tại
*/
app.controller("changePassCtrl", function ($scope, $http, $routeParams) {

  $scope.changeP = function () {

    $http.get('http://localhost:3000/students/' + $routeParams.id).then(function (res) {
      $scope.userInfo = res.data;
    });

    if ($scope.nowpass == $scope.userInfo.password) {

      $http.patch('http://localhost:3000/students/' + $routeParams.id, {
        password: $scope.newpass
      })
        .then(function (res) {
          $scope.msg = "Success";
          alert($scope.msg);
        })
        .catch(function (error) {
          $scope.errorMessage = "Update Failed!";
          alert($scope.errorMessage);
        });

    }
    else {
      alert("Không đúng mật khẩu cũ");
    }

  }

});

/* Forgot Controller
* Lấy thông tin tất cả người dùng
* Sử dụng vòng lặp để lọc dữ liệu
* Nếu dữ liệu người dùng nhập vào đúng với dữ liệu hệ thống thì sẽ cấp lại mật khẩu
*/
app.controller("forgotCtrl", function ($scope, $http) {

  $http.get('http://localhost:3000/students').then(function (res) {
    $scope.user = res.data;
  });
  $scope.forgot = function () {
    $scope.lengthStudents = $scope.user.length;
    for (var i = 0; i < $scope.lengthStudents; i++) {
      if ($scope.user[i].email == $scope.email && $scope.user[i].username == $scope.username) {
        alert("Your password is: " + $scope.user[i].password);
      }

    }

  }

});

/* List Student Controller
* Dùng phương thức get để lấy dữ liệu tất cả người dùng
*/
app.controller("listCtrl", function ($scope, $http) {
  $http.get('http://localhost:3000/students').then(function (res) {
    $scope.students = res.data;
  });
});

/* List Marks
* Lấy danh điểm bằng cách tìm kiếm dữ liệu thông qua ID người dùng
* Điểm sẽ hiển thị ra theo ID người dùng hiện tại
*/
app.controller("listMarkCtrl", function ($scope, $http, $routeParams) {
  $http.get('http://localhost:3000/marks?idStudent=' + $routeParams.id).then(function (res) {
    $scope.list_history = res.data;
  });
});


//  Quiz 
app.directive('quiz', function (quizFactory, $routeParams, $http, $cookies) {
  return {
    restrict: 'AE',
    scope: {},
    templateUrl: 'quiz/template-quiz.html',
    link: function (scope, elem, attrs) {

      /* Start the quiz 
      * Lấy tên thông qua name đã truyền vào URL
      * Vô hiệu hóa kết thúc bài quiz
      * Show phần làm trắc nghiẹn
      */
      scope.start = function () {
        quizFactory.getQuestions().then(function () {
          scope.subjectName = $routeParams.name;
          scope.id = 1;
          scope.quizOver = false;
          scope.inProgess = true;
          scope.getQuestion();
        });
      };

      /* Save the quiz 
      * Lưu kết quả bài thi
      * Bổ sung một cột ID người dùng để sau này lấy điểm ra theo ID người dùng
      */
      scope.save = function () {
        scope.infoStudent = $cookies.getObject("user");
        $http.post('http://localhost:3000/marks/', {
          idStudent: scope.infoStudent.id,
          quizName: $routeParams.name,
          quizId: $routeParams.id,
          quizMark: scope.score
        }).then(function (response) {
          alert("Lưu kết quả thành công");
        }).catch(function (error) {
          alert("Lưu thất bại");
        });
      }

      // End the quiz
      scope.end = function () {
        scope.quizOver = true;
      }

      // Reset the quiz 
      scope.reset = function () {
        scope.inProgess = false;
        scope.score = 0;
      };

      // Start Quiz Again 
      scope.startAgain = function () {
        location.reload();
        scope.inProgess = false;
        scope.score = 0;
      };

      /* Get question
      * Lấy câu hỏi ra theo ID khóa học
      */ 
      scope.getQuestion = function () {
        var quiz = quizFactory.getQuestion(scope.id);
        if (quiz) {
          scope.question = quiz.Text;
          scope.options = quiz.Answers;
          scope.answer = quiz.AnswerId;
          scope.answerMode = true;
        }
        else {
          scope.quizOver = true;
        }
      }

      /*
      * Kiểm tra câu trả lời đã chính xác hay chưa
      * Lấy giá trị input đang checked
      * Kiểm tra nếu đúng thì điểm +1
      */
      scope.checkAnswer = function () {
        if (!$('input[name = answer]:checked').length) return;
        var ans = $('input[name = answer]:checked').val();
        if (ans == scope.answer) {
          // alert("Đúng rồi");
          scope.score++;
          scope.correctAns = true;
        }
        else {
          // alert("Sai");
          scope.correctAns = false;
        }
        scope.answerMode = false;
        ;
      }
      
      /*
      * Chuyển câu hỏi
      * Tăng ID lên 1
      * Hiển thị câu hỏi mới
      */ 
      scope.nextQuestion = function () {
        scope.id++;
        scope.getQuestion();
      }
      scope.reset();
    }
  }
});

app.factory('quizFactory', function ($http, $routeParams) {

  return {

    // Lấy tất cả câu hỏi
    getQuestions: function () {
      return $http.get('../../Assignment/db/Quizs/' + $routeParams.id + '.js').then(function (res) {
        questions = res.data;
      });
    },
    
    /*
    * Random câu hỏi
    * Đặt giới hạn câu hỏi là 10
    */ 
    getQuestion: function (id) {
      var randomItem = questions[Math.floor(Math.random() * questions.length)];
      var count = questions.length;
      if (count > 10) {
        count = 10;
      }
      if (id < count) {
        return randomItem;
      }
      else {
        return false;
      }
    }
  }
});


