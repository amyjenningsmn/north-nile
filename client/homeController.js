angular.module('northApp').controller('HomeController', ['$http', '$mdDialog', function($http, $mdDialog){

  var hc = this;
  var alert;
  hc.loginInfo = {};
  hc.registerInfo = {};

  // :::: ng-show Functions ::::

  // loginShow():
  hc.loginShow = function() {
    hc.loginForm = true;
    hc.registerForm = false;
  };

// registerShow():
  hc.registerShow = function() {
    console.log('hit registerShow');
    hc.registerForm = true;
    hc.loginForm = false;
  };

// :::: Login User, redirect based on success/failure ::::

hc.loginUser = function() {
  $http.post('/login', hc.loginInfo).then(function(response){
    if (response.status == 200) {
      console.log('successful login', response.data.isAdmin);
    if (response.data.isAdmin == true) {
      console.log('admin is true');
      hc.loginInfo = {};
      hc.adminDashboard=true;
      hc.userDashboard=false;
      hc.registerForm = false;
      hc.loginForm = false;
    } else {
      console.log('admin is not true');
      hc.loginInfo = {};
      hc.userDashboard=true;
      hc.adminDashboard=false;
      hc.registerForm=false;
      hc.loginForm=false;
    }
   }
  }, function(response){
    console.log('unsuccessful login');
    // Alert user to incorrect username/password ::::
    function showAlert() {
      alert = $mdDialog.alert({
        title: 'Attention',
        textContent: 'Incorrect username and/or password. Please enter information again.',
        ok: 'Close'
      });
      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });
    };
    showAlert();
    hc.loginInfo = {};

  });
};

// :::: Register User ::::

hc.registerUser = function() {
  $http.post('/register', hc.registerInfo).then(function(response){
    if (response.status == 200){
      console.log('successful registration');
      // Function below will prompt login. Would be nice to automatically login user?
      function showAlert() {
        alert = $mdDialog.alert({
          title: 'Congratulations!',
          textContent: 'Registration successful, please log in.',
          ok: 'Close'
        });
        $mdDialog
          .show( alert )
          .finally(function() {
            alert = undefined;
          });
      };
      showAlert();
      hc.registerInfo={};
      hc.registerForm=false;
      hc.loginForm=true;

    }
  }, function(response){
    console.log('unsuccessful registration');
    function showAlert() {
      alert = $mdDialog.alert({
        title: 'Attention',
        textContent: 'Username already exists, please choose another.',
        ok: 'Close'
      });
      $mdDialog
        .show( alert )
        .finally(function() {
          alert = undefined;
        });
    };
    showAlert();
    hc.registerInfo.username = undefined;
  });
};



  console.log('Home controller loaded.');
}]);