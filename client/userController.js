angular.module('northApp').controller('UserController', ['Upload','UserTrackFactory', '$http', '$mdDialog','ResourceFactory', function(Upload,UserTrackFactory, $http, $mdDialog, ResourceFactory){
  console.log('user controller loaded.');
  var uc = this;
  uc.user = {};
  var promise = UserTrackFactory.getUserData();
  promise.then(function(response){
    console.log(response.data);
    uc.user = response.data;
    uc.getUserResources(uc.user);
  });
  // uc.user = UserTrackFactory.user;
  //ability to add new resource //
  uc.userResources=ResourceFactory.userResources;
  uc.editUserResource = ResourceFactory.editUserResource;
  uc.getUserResources = ResourceFactory.getUserResources;
  uc.approvedResources = ResourceFactory.approvedResources;


  console.log('user controller called getUserResources');

  uc.addNewResource = function(){
    console.log('uc.user:', uc.user);
    uc.newResourceOptions = {
      templateUrl: '/views/new-resource-user.html',
      clickOutsideToClose: true,
      controller: 'UserNewResourceController',
      controllerAs: 'unrc',
      locals: {
        isAdmin: uc.user.is_admin
      }
    };
    // console.log('mdDialog', $mdDialog.show(uc.newResourceOptions));
    $mdDialog.show(uc.newResourceOptions);
    console.log('finished addnewResource function');
  };

  // edit dialogs
  uc.editUserResource = function(resource){
    console.log('editUserResource:', resource);
    uc.editPendingOptions = {
      templateUrl: '/views/edit-resource.html',
      clickOutsideToClose: true,
      controller: 'EditResourceController',
      controllerAs:'erc',
      resolve:{
        userResource: function(){
          return resource;
        }
      }
    };
    $mdDialog.show(uc.editPendingOptions);
  };


}]);

angular.module('northApp').controller('UserNewResourceController', ['Upload','UserTrackFactory','isAdmin', '$mdDialog', 'ResourceFactory', function(Upload,UserTrackFactory, isAdmin,$mdDialog, ResourceFactory){
  console.log('UserNewResourceController has loaded', isAdmin);
  var unrc=this;
  unrc.isAdmin = isAdmin;
  unrc.newImagePaths = ResourceFactory.newImagePaths;
  unrc.newResource = {is_active:false, city_name:"Minneapolis", state:"MN"};

  var promise = UserTrackFactory.getUserData();
  promise.then(function(response){
    unrc.user = response.data;
    console.log('user user:', unrc.user);
  });

  // unrc.uploadAudio = function(audio, resource){
  //   console.log('uploading audio');
  //   Upload.upload({
  //     url: '/upload/audio',
  //     data: {file: audio.file}
  //   }).then(function(response){
  //     console.log('Successfully uploaded audio:', response);
  //     resource.audio_id = response.data.audio_id;
  //     unrc.uploadAudioSuccess = true;
  //   }, function(response){
  //     console.log('Failed at uploading audio:', response);
  //   }, function(evt){
  //     // console.log('evt', evt)
  //   });
  // };

  unrc.uploadAudio = function(audio){
    ResourceFactory.uploadAudio(audio, unrc.updateAudioInfo);
  };

  unrc.updateAudioInfo = function(audio_id, audio_reference){
    unrc.newResource.audio_id = audio_id;
    unrc.newResource.audio_reference = audio_reference;
  };

  unrc.removeAudio = function(id){
    ResourceFactory.removeAudio(id, unrc.clearAudioPath);
  };

  unrc.clearAudioPath = function(){
    unrc.newResource.audio_reference = '';
  };

  // unrc.uploadImage = function(image, resource){
  //   Upload.upload({
  //     url: '/upload/image',
  //     arrayKey: '',
  //     data: {file: image.file}
  //   }).then(function(response){
  //     console.log('Success response?', response);
  //     // save rest of resource
  //     resource.image_id = response.data.image_id;
  //     unrc.uploadImageSuccess = true;
  //
  //   }, function(response){
  //     console.log('Error response?', response);
  //   }, function(evt){
  //     // use for progress bar
  //     console.log('Event response?', evt);
  //   });
  //   // end image upload
  // };

  unrc.uploadImage = function(image){
    ResourceFactory.uploadImage(image, unrc.updateImageInfo);
  };

  unrc.updateImageInfo = function(){
    for (path in unrc.newImagePaths.paths) {
      console.log('path:', path);
      if(unrc.newImagePaths.paths[path] == ""){
        unrc.newImagePaths.paths[path] = "//:0";
      }
    }
    console.log('newImages:', unrc.newImagePaths.paths);
    unrc.newResource.image_id = unrc.newImagePaths.image_id;
    unrc.newResource.path1 = unrc.newImagePaths.paths.path1;
    unrc.newResource.path2 = unrc.newImagePaths.paths.path2;
    unrc.newResource.path3 = unrc.newImagePaths.paths.path3;
    unrc.newResource.path4 = unrc.newImagePaths.paths.path4;
    unrc.newResource.path5 = unrc.newImagePaths.paths.path5;
    // epc.newImagePaths = {};
  };

  unrc.saveNewResource = function(resource){
    resource.is_pending = true;
    resource.account_id = unrc.user.id;
    resource.date_created = new Date();
    ResourceFactory.saveNewResource(resource, unrc.user);
    $mdDialog.hide();
  };
  unrc.cancelNewResource = function(){
    $mdDialog.hide();
  };
}]);
// edit modal for user's resources//
angular.module('northApp').controller('EditResourceController', ['Upload','userResource', '$mdDialog', 'ResourceFactory', function(Upload, userResource,  $mdDialog, ResourceFactory){
  var erc = this;
  erc.userResource = userResource;
  erc.newImagePaths = ResourceFactory.newImagePaths;

  erc.cancelEditPending = function(){
    console.log('uc.userResource:', userResource);
    $mdDialog.hide();
    erc.userResource = {};
  };

  erc.saveEdit = function(){
    erc.userResource.is_pending = !erc.userResource.is_active;
    console.log('erc.userResource:', erc.userResource);
    ResourceFactory.updateResource(erc.userResource);
    erc.user = {};
    $mdDialog.hide();
  };

  erc.confirmRemoveResource = function(){
    erc.showConfirmRemove = true;
  };

  erc.cancelRemoveResource = function(){
    erc.showConfirmRemove = false;
  };

  erc.removeResource = function(resource){
    ResourceFactory.removeResource(resource);
    erc.showConfirmRemove = false;
    $mdDialog.hide();
  };

  // image upload
  erc.showRemoveButton = function(place){
    console.log('Show remove button:', erc.userResource['path' + place]);
    if(erc.userResource['path' + place]==='//:0' || erc.userResource['path' + place]==='' ){
      return true;
    }
  };

  erc.removeImage = function(id, place){
    ResourceFactory.removeImage(id, place, erc.updateImageInfo);
  };

  erc.updateImageInfo = function(){
    for (path in erc.newImagePaths.paths) {
      console.log('path:', path);
      if(erc.newImagePaths.paths[path] == ""){
        erc.newImagePaths.paths[path] = "//:0";
      }
    }
    console.log('newImages:', erc.newImagePaths.paths);
    if(erc.newImagePaths.image_id){
        erc.userResource.image_id = erc.newImagePaths.image_id;
    } else if(erc.newImagePaths.id){
      erc.userResource.image_id = erc.newImagePaths.id;
    }

    erc.userResource.path1 = erc.newImagePaths.paths.path1;
    erc.userResource.path2 = erc.newImagePaths.paths.path2;
    erc.userResource.path3 = erc.newImagePaths.paths.path3;
    erc.userResource.path4 = erc.newImagePaths.paths.path4;
    erc.userResource.path5 = erc.newImagePaths.paths.path5;
    // erc.newImagePaths = {};
  };

  erc.updateImage = function(image, id, place){
      ResourceFactory.updateImage(image, id, place, erc.updateImageInfo);
  };

  erc.uploadImage = function(image){
    ResourceFactory.uploadImage(image, erc.updateImageInfo)
  };

  erc.removeAudio = function(id){
    ResourceFactory.removeAudio(id, erc.clearAudioPath);
  };

  erc.clearAudioPath = function(){
    erc.userResource.audio_reference = '';
  };

  erc.uploadAudio = function(audio){
    ResourceFactory.uploadAudio(audio, erc.updateAudioInfo);
  };

  erc.updateAudio = function(audio, id){
    ResourceFactory.updateAudio(audio, id, erc.updateAudioInfo);
  };

  erc.updateAudioInfo = function(audio_id, audio_reference){
    erc.userResource.audio_id = audio_id;
    erc.userResource.audio_reference = audio_reference;
  };


  console.log('Edit Resource Controller loaded.', erc.userResource);
}]);
