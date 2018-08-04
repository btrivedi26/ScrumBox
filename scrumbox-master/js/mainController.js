/* global EmojiPicker */
'use strict';

angular
  .module('fireideaz')

  .controller('MainCtrl', ['$scope','$timeout','$filter', '$window','$http', 'Utils', 'Auth',
  '$rootScope', 'FirebaseService', 'ModalService',
    function ($scope,$timeout, $filter, $window,$http,utils, auth, $rootScope, firebaseService, modalService,) {
      $scope.actionassignedto='';
    $scope.actioncomment='';
   
    //code added to show dashboard from board screen -- start here
    if(localStorage.getItem("showDashboard")=="true")
    {
     
 $scope.userId='';
      $scope.showDashboard=true;
      $scope.loading=false;
      $scope.loginuserfirstname=localStorage.getItem("userFirstName");
      $scope.loginuserlastname=localStorage.getItem("userLastName");
      $scope.loginuserfullname=$scope.loginuserfirstname + " " + $scope.loginuserlastname;
      $scope.linkedinid=localStorage.getItem("userId");;    
      getDashboardDetails();
     
      return;
    }
    //code added to show dashboard from board screen -- end here
      if(typeof $scope.LinkedInValidated==="undefined")
      {
        if($scope.Path=="Dashboard")
        {
        }
        else
        {
        $scope.LinkedInValidated=false;
        }
      }

      $scope.isLinkedInValidated=localStorage.getItem("isLinkedInValidated");

      if($scope.isLinkedInValidated=="true")
      {
        $scope.LinkedInValidated=true;
      }
      $scope.isUndefined = function (thing) {
    
        if(typeof thing === "undefined")
        {
          $scope.LinkedInValidated=true;
        }
        else
        {
          $scope.LinkedInValidated=thing;
        }
        return $scope.LinkedInValidated;
    }
     
      $scope.loading = true;
      $scope.showDashboard=false;
      $scope.messageTypes = utils.messageTypes;
      $scope.utils = utils;
      $scope.token="";
      $scope.state="";
      $scope.newBoard = {
        name: '',
        text_editing_is_private: true,
        teamname:'',
        firstname:'',
        lastname:'',
        linkedinid:'',
        actionitemcount:0,
        boarddate:firebaseService.getServerTimestamp()
      };
      
      $scope.userId = $window.location.hash.substring(1) || '';
      $scope.searchParams = {};
      $window.location.search.substr(1).split('&').forEach(function(pair){
        
        var keyValue = pair.split('=');
        
        $scope.searchParams[keyValue[0]] = keyValue[1];
        //code for the linked in validation using .net web api

        if(keyValue[0]!=null)
        {
          if(keyValue[0]=="code")
            $scope.token=keyValue[1];
            if(keyValue[0]=="state")
            $scope.state=keyValue[1];
        }


      
      });
    
      if($scope.token!="" && $scope.state!="")
      {
        $scope.showDashboard=true;
        //http://13.58.186.127/authenticateAPI/api
        $http.get('http://13.58.186.127/authenticateAPI/api/Authenticate?code='+$scope.token +'&state='+$scope.state)
      //  $http.get('http://localhost:65450/api/Authenticate?code='+$scope.token +'&state='+$scope.state)
		.then(function (response){

      if(response.data!=null)
      {
  
        if(response.data!="No Response")
        {
          $scope.LinkedInValidated=true;
          $scope.loginuserfirstname=response.data.firstName;
          localStorage.setItem("userFirstName",response.data.firstName);
          $scope.loginuserlastname=response.data.lastName;
          localStorage.setItem("userLastName",response.data.lastName);
          $scope.loginuserfullname=$scope.loginuserfirstname + " " + $scope.loginuserlastname;
          $scope.linkedinid=response.data.id;
          localStorage.setItem("userId",response.data.id);
          getDashboardDetails();
        }
        else
        {
          $scope.linkedinvalidated=false;
        }
        
        
       
      }
		//	$scope.jsondata = response.data;
			//console.log("status:" + response.status);
		}).catch(function(response) {
     
      console.log(response);
		  console.error('Error occurred:', response.status, response.data);
		}).finally(function() {
			 console.log("Task Finished.");
		});

      }
      $scope.sortField = $scope.searchParams.sort || 'date_created';
      $scope.selectedType = 1;
      $scope.import = {
        data : [],
        mapping : []
      };

      $scope.droppedEvent = function(dragEl, dropEl) {
        var drag = $('#' + dragEl);
        var drop = $('#' + dropEl);
        var dragMessageRef = firebaseService.getMessageRef($scope.userId, drag.attr('messageId'));

        dragMessageRef.once('value', function() {
          dragMessageRef.update({
            type: {
              id: drop.data('column-id')
            }
          });
        });
      };

      function getDashboardDetails() {
        var databoarddetails = firebaseService.getDashBoardDetails(localStorage.getItem("userId"));
        $scope.dashboarddetails = firebaseService.newFirebaseArray(databoarddetails);
        var log = new Array($scope.dashboarddetails);
        console.log(log);
      }

      

      function getBoardAndMessages(userData) {
        $scope.userId = $window.location.hash.substring(1) || '499sm';

        var messagesRef = firebaseService.getMessagesRef($scope.userId);
        var board = firebaseService.getBoardRef($scope.userId);

        $scope.boardObject = firebaseService.getBoardObjectRef($scope.userId);

        board.on('value', function(board) {
          if (board.val() === null) {
            window.location.hash = '';
            location.reload();
          }

          $scope.board = board.val();
          $scope.maxVotes = board.val().max_votes ? board.val().max_votes : 6;
          $scope.boardId = $rootScope.boardId = board.val().boardId;
          $scope.boardContext = $rootScope.boardContext = board.val().boardContext;
          $scope.loading = false;
          $scope.hideVote = board.val().hide_vote;
          $scope.boardlinkedinid=board.val().linkedinid;
         
          setTimeout(function() {new EmojiPicker();}, 100);
        });

        $scope.boardRef = board;
        $scope.messagesRef = messagesRef;
        $scope.userUid = userData.uid;
        $scope.messages = firebaseService.newFirebaseArray(messagesRef);
      }

      if ($scope.userId !== '') {
        auth.logUser($scope.userId, getBoardAndMessages);
      } else {
        $scope.loading = false;
      }

      $scope.isColumnSelected = function(type) {
        return parseInt($scope.selectedType) === parseInt(type);
      };

      $scope.isCensored = function(message, privateWritingOn) {
        return message.creating && privateWritingOn;
      };

      $scope.updatePrivateWritingToggle = function(privateWritingOn) {
        $scope.boardRef.update({
          text_editing_is_private: privateWritingOn
        });
      };

      $scope.updateEditingMessage = function(message, value) {
      
        message.creating = value;
        $scope.messages.$save(message);
      };

      $scope.getSortFields = function() {
        return $scope.sortField === 'votes' ? ['-votes', 'date_created'] : 'date_created';
      };

      $scope.saveMessage = function(message) {
        message.creating = false;
        $scope.messages.$save(message);
      };

      $scope.saveActionItems = function(message) {
      
      };

      function redirectToBoard() {
        $scope.showDashboard=false;
        window.location.href = window.location.origin +
          window.location.pathname + '#' + $scope.userId;
         // $scope.showDashboard=false;
      }

      function redirectToHome() {
        $scope.showDashboard=false;
        window.location.href = window.location.origin +
          window.location.pathname ;
         // $scope.showDashboard=false;
      }

      $scope.isBoardNameInvalid = function() {
        
        return !$scope.newBoard.name || !$scope.newBoard.teamname;
      };

      $scope.isMaxVotesValid = function() {
        return Number.isInteger($scope.newBoard.max_votes);
      };

      $scope.navigateToBoard=function()
{
  
  $scope.loading = true;
  $scope.showDashboard = false;
  modalService.closeAll();
  $scope.userId = utils.createUserId();
  modalService.openAddNewBoard($scope)
}


$scope.navigateDashToBoard=function()
{
  
  localStorage.setItem("isLinkedInValidated","true");
  $scope.loading = true;
  $scope.LinkedInValidated=true;
  $scope.showDashboard = false;
  modalService.closeAll();
  $scope.userId = utils.createUserId();
  modalService.openAddNewBoard($scope)
}

$scope.redirectToLinkedPage=function()
{
  $scope.showDashboard=true;
  window.location.href = "https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=77y6szcym3yi3y&redirect_uri=http://localhost:4000&state=987654321&scope=r_basicprofile";
}

$scope.redirectToBoard=function(boardid)
{
  localStorage.setItem("isLinkedInValidated","true");
  $scope.loading = true;
  $scope.LinkedInValidated=true;
  $scope.showDashboard = false;
  $scope.LinkedInValidated=true;
  window.location.href = "http://localhost:4000/#"+boardid;
}

      $scope.createNewBoard = function() {
        $scope.loading = true;
        modalService.closeAll();
        $scope.userId = utils.createUserId();

        var callback = function(userData) {
          var board = firebaseService.getBoardRef($scope.userId);
          board.set({
            boardId: $scope.newBoard.name,
            date_created: new Date().toLocaleDateString(),
            columns: $scope.messageTypes,
            user_id: userData.uid,
            max_votes: $scope.newBoard.max_votes || 6,
            text_editing_is_private : $scope.newBoard.text_editing_is_private,
            teamname:$scope.newBoard.teamname,
            firstname:localStorage.getItem("userFirstName"),
            lastname:localStorage.getItem("userLastName"),
            linkedinid:localStorage.getItem("userId"),
            actionitemcount:0,
            boarddate:firebaseService.getServerTimestamp()
          }, function(error) {
             if (error) {
                $scope.loading = false;
             } else {
                redirectToBoard();
             }
          });

          $scope.newBoard.name = '';
        };

        auth.createUserAndLog($scope.userId, callback);
      };

      $scope.changeBoardContext = function() {
        
        $scope.boardRef.update({
          boardContext: $scope.boardContext
        });
      };

      $scope.changeBoardName = function(newBoardName) {
        $scope.boardRef.update({
          boardId: newBoardName
        });

        modalService.closeAll();
      };

      $scope.updateSortOrder = function() {
        var updatedFilter = $window.location.origin + $window.location.pathname + '?sort=' + $scope.sortField + $window.location.hash;
       
        $window.history.pushState({ path: updatedFilter }, '', updatedFilter);
      };

      $scope.addNewColumn = function(name) {
        if(typeof name === 'undefined' || name === '') {
          return;
        }

        $scope.board.columns.push({
          value: name,
          id: utils.getNextId($scope.board)
        });

        var boardColumns = firebaseService.getBoardColumns($scope.userId);
        boardColumns.set(utils.toObject($scope.board.columns));

        modalService.closeAll();
      };

      $scope.changeColumnName = function(id, newName) {
        if(typeof newName === 'undefined' || newName === '') {
          return;
        }

        $scope.board.columns.map(function(column, index, array) {
          if (column.id === id) {
            array[index].value = newName;
          }
        });

        var boardColumns = firebaseService.getBoardColumns($scope.userId);
        boardColumns.set(utils.toObject($scope.board.columns));

        modalService.closeAll();
      };

      $scope.deleteColumn = function(column) {
        $scope.board.columns = $scope.board.columns.filter(function(_column) {
            return _column.id !== column.id;
        });

        

        var boardColumns = firebaseService.getBoardColumns($scope.userId);
        boardColumns.set(utils.toObject($scope.board.columns));
        modalService.closeAll();
      };

      $scope.deleteMessage = function(message) {
        $scope.messages.$remove(message);

        modalService.closeAll();
      };

      function addMessageCallback(message) {
        var id = message.key;
        angular.element($('#' + id)).scope().isEditing = true;
        new EmojiPicker();
        $('#' + id).find('textarea').focus();
      }

      $scope.assignActionItems = function(assignedto,actioncomment) {
    
        var key=localStorage.getItem('messagekey');
    
        var board = firebaseService.getBoardRef($scope.userId);
        var messagesRef = firebaseService.getMessagesRef($scope.userId,key);
        $scope.actionitemcount=0;
       
        messagesRef.child(key).update({
          isactionitem: "Y",
          actioncomment:actioncomment,
          actionassignedto:assignedto,
          date: firebaseService.getServerTimestamp()
        });
         
        board.on('value', function(board) {
          if (board.val() === null) {
            window.location.hash = '';
            location.reload();
          }

          $scope.board = board.val();
          $scope.actionitemcount = board.val().actionitemcount;
          
      
        });
        board.update({
          actionitemcount: $scope.actionitemcount + 1
           });
        alert("Action Item Assigned");
        modalService.closeAll();
       return;
      };
      

      $scope.addNewMessage = function(type) {
        $scope.messages.$add({
          text: '',
          creating: true,
          user_id: $scope.userUid,
          type: {
            id: type.id
          },
          date: firebaseService.getServerTimestamp(),
          date_created: firebaseService.getServerTimestamp(),
          votes: 0,
          isactionitem:'N',
          actioncomment:'',
          actionassignedto:''
        }).then(addMessageCallback);
      };

      $scope.deleteCards = function() {
        $($scope.messages).each(function(index, message) {
          $scope.messages.$remove(message);
        });

        modalService.closeAll();
      };

      $scope.deleteBoard = function() {
        $scope.deleteCards();
        $scope.boardRef.ref.remove();

        modalService.closeAll();
        window.location.hash = '';
        location.reload();
      };

      $scope.submitOnEnter = function(event, method, data) {
        if (event.keyCode === 13) {
          switch (method) {
            case 'createNewBoard':
              if (!$scope.isBoardNameInvalid()) {
                $scope.createNewBoard();
              }

              break;
            case 'addNewColumn':
              if (data) {
                $scope.addNewColumn(data);
                $scope.newColumn = '';
              }

              break;
          }
        }
      };

      $scope.cleanImportData = function () {
        $scope.import.data = [];
        $scope.import.mapping = [];
        $scope.import.error = '';
      };

      $scope.DisplayActionItems=function(isactionitem)
      {
      
        if($scope.isLinkedInValidated=="true")
        {
          if(isactionitem=="Y")
          {
            return false; 
          }
          else
          {
          return true;
          }
        }
        else
        {
         if($scope.boardlinkedinid!=null)
         {
           return true;
         }
         else
         {
          return false;
         }
        }
      }
  
      $scope.showDash=function()
{
 
  window.location.href="http://localhost:4000";
  localStorage.setItem("showDashboard",true);

}

      /* globals Clipboard */
      new Clipboard('.import-btn');

      angular.element($window).bind('hashchange', function() {
        $scope.loading = true;
        $scope.userId = $window.location.hash.substring(1) || '';
        auth.logUser($scope.userId, getBoardAndMessages);
      });
    }
  ]);
