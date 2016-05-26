angular.module('northApp').controller('AdminController', ['UserTrackFactory', '$http', '$mdDialog', function(UserTrackFactory, $http,$mdDialog){
  var ac = this;

  UserTrackFactory.getUserData();

  ac.user = UserTrackFactory.user;

  // dummy data
  ac.dummyText1 = 'Leverage agile frameworks to provide a robust synopsis for high level overviews. Iterative approaches to corporate strategy foster collaborative thinking to further the overall value proposition. Organically grow the holistic world view of disruptive innovation via workplace diversity and empowerment.';
  // ac.storedResources = [
  //   {
  //     lat: 44.996121,
  //     lng: -93.295845,
  //     title: 'Mr. Books Bruschetta Machine',
  //     type: 'one',
  //     visible: false,
  //     username: 'Bruschetta4Lyfe',
  //     dateCreated: 'Jan 26th, 2016',
  //     pending: true
  //   },
  //   {
  //     lat: 44.998995,
  //     lng: -93.291068,
  //     title: 'Ms. Kitchens Oblique Reference Parlor',
  //     type: 'two',
  //     visible: false,
  //     username: 'kitchen86',
  //     dateCreated: 'Dec 4th, 2016',
  //     pending: true
  //   },
  //    {
  //       lat: 44.999143,
  //       lng: -93.297133,
  //       title: 'Mr. Bones Bruschetta Machine',
  //       type: 'one',
  //       visible: false,
  //       username: 'Bruschetta4Lyfe',
  //       dateCreated: 'May 3rd, 2016',
  //       pending: false
  //   },
  //   {
  //     lat: 45.002572,
  //     lng: -93.289515,
  //     title: 'Ms. Burbakers Oblique Reference Parlor',
  //     type: 'two',
  //     visible: false,
  //     username: 'brubaker_conglomerate',
  //     dateCreated: 'Apr 6th, 2016',
  //     pending: true
  // }];

  ac.savedResources = ResourceFactory.savedResources;

  // generate arrays for tables -> functions moved to ResourceFactory
  // ac.filterApprovedResources = function(){
  //   ac.approvedResources = ac.savedResources.filter(function(resource){
  //     if(!resource.pending){
  //       return true;
  //     }
  //   });
  // };
  //
  // ac.filterPendingResources = function(){
  //   console.log('ac.savedResources:', ac.savedResources);
  //   ac.moderationQueue = ac.savedResources.filter(function(resource){
  //     if(resource.pending){
  //       return true;
  //     }
  //   });
  // };


  ac.getSavedResources = ResourceFactory.getSavedResources;
  ac.pendingResources = ResourceFactory.pendingResources;
  ac.approvedResources = ResourceFactory.approvedResources;

  ac.selectedModerationResources = [];
  ac.selectedModerationResource = {};
  // ac.approvedResources = [];
  // ac.moderationQueue = [];
  // ac.selectedResource = {
  //   lat: 44.998995,
  //   lng: -93.291068,
  //   title: 'Ms. Kitchens Oblique Reference Parlor',
  //   type: 'two',
  //   visible: false,
  //   username: 'kitchen86',
  //   dateCreated: 'Dec 4th, 2016',
  //   pending: true
  // };

  // approve resources en masse
  ac.approveResources = function(){
    console.log('approving resources.');
    ac.selectedModerationResources.map(function(resource){
      resource.is_pending = false;
    });
    // post to database here -> updateResource
  };


  // edit dialogs

  // needs to be updated for modal
  ac.editResource = function(resource){
    // event.stopPropagation();
    // ac.selectedResource = resource;
    console.log('ac.selectedResource:', ac.selectedResource);
    ac.editPendingOptions = {
      templateUrl: '/views/edit-pending.html',
      clickOutsideToClose: true,
      controller: 'EditPendingController',
      controllerAs:'epc',
      resolve:{
        selectedResource: function(){
          return resource;
        }
      }
    }
     $mdDialog.show(ac.editPendingOptions);
  };

  ac.getSavedResources();
  console.log('admin controller loaded!');
}]);

angular.module('northApp').controller('EditPendingController', ['selectedResource', '$mdDialog', 'ResourceFactory', function(selectedResource,  $mdDialog, ResourceFactory){
  var epc = this;

  epc.selectedResource = selectedResource;

  epc.cancelEditPending = function(){
    console.log('ac.selectedResource:', selectedResource);
    $mdDialog.hide();
  };

  epc.saveEditPending = function(){
    // add save logic here -> probably need to post to server/database
    epc.selectedResource.is_pending = !epc.selectedResource.is_active; // make pending value false based on approve value
    console.log('epc.selectedResource:', epc.selectedResource);
    ResourceFactory.updateResource(epc.selectedResource);
    $mdDialog.hide();
  };

  console.log('Edit Pending Controller loaded.');
}]);
