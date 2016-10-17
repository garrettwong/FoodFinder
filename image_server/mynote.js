$(function() {
	$("#input-to-do").tooltip();
	mynote.init();
});

var mynote = {
	todoNoteJsonObj: [],
	getData: function () {
		// Let's get all the local data first
		if (storageApi.localStorageSupported() ){
			mynote.todoNoteJsonObj = JSON.parse(localStorage.getItem("todoNotes-db")) === null ? [] : JSON.parse(localStorage.getItem("todoNotes-db"));
		}
		// If elements exist, let's populate our view
		if (mynote.todoNoteJsonObj.length > 0) {
			for (var i in mynote.todoNoteJsonObj) {
				if (mynote.todoNoteJsonObj[i].complete === 0){
					var li = '<li class="span10 hide todos-element" id="todos-element-' + 
						mynote.todoNoteJsonObj[i].id + 
						'"><label class="checkbox"><input type="checkbox" id="checkbox-' + 
						mynote.todoNoteJsonObj[i].id + '">' + mynote.todoNoteJsonObj[i].text + 
						'</label><a class="destroy"></li>';
					$("#todo-list").append(li);
					$("#todo-list .todos-element").slideDown('medium');
				}
			}
			mynote.todoEventListeners();
		}
	
		// This will get all the database stored data
		$.ajax({
			url: "phprest.php",
			type:"GET",
			dataType: "json",
			contentType: "application/json",
			data: {"token": fbUser.userID, "method": "getdata"},
			success: function(data) {
				var allNotesHtml = '';
				for (var i in data.notes) {
					allNotesHtml += '<div class="note-div span11"><h3>' + (data.notes[i].title === "" ? "No Title" : data.notes[i].title + " (" + data.notes[i].date.split(" ")[0] + ")") + 
						'<button id="note-update-' + data.notes[i].id + '" class="btn btn-primary pull-right note-update">Update ' + data.notes[i].title + '</button></h3>' + 
						'<textarea id="note-' + data.notes[i].id + '" class="span11" style="height:150px;">';
					allNotesHtml += data.notes[i].content;
					allNotesHtml += '</textarea></div>';
				}
				$("#all-notes").html(allNotesHtml.replace(new RegExp("(\<br \/\>)", "g"), ""));
				
				var scheduleHtml = '';
				for (var i in data.schedule) {
					scheduleHtml += data.schedule[i].content;
				}
				s = scheduleHtml;
				$("#schedule-text").val(scheduleHtml.replace(new RegExp("(\<br \/\>)", "g"), ""));
								
				var toLearnHtml = '';
				for (var i in data.tolearn) {
					toLearnHtml += data.tolearn[i].content;
				}
				$("#to-learn-text").val(toLearnHtml.replace(new RegExp("(\<br \/\>)", "g"), ""));
				
				
				// Bind Note Listeners
				mynote.updateNote();
			}
		});
	},
	todoEventListeners: function () {
		$(".todos-element").unbind();
		$("#todo-list li").unbind();
		$("#todo-list li").unbind();
		$(".destroy").unbind();
		
		// Cross Out
		$(".todos-element").on('change', function () {
			if ($(this).css('text-decoration') === 'line-through') {
				$(this).css({'text-decoration': 'none', 'color' : '#333'});
				// Set complete = 0
				var position = $(this).attr('id').split('todos-element-')[1];
				mynote.todoNoteJsonObj[position].complete = 0;
			} else {
				$(this).css({'text-decoration': 'line-through', 'color' : '#777'});
				// Set complete = 1
				var position = $(this).attr('id').split('todos-element-')[1];
				mynote.todoNoteJsonObj[position].complete = 1;
			}
			
			// Save
			mynote.localDbSave();
		});
		// Show Destroy
		$("#todo-list li").on('mouseover', function (event) {
			$(".destroy", this).show();
		});
		// Hide Destroy
		$("#todo-list li").on('mouseout', function (event) {
			$(".destroy", this).hide();
		});
		// Destroy and Remove
		$(".destroy").on('click', function () {
			$(this).parent().animate({height:0, opacity:0}, '250', function () {
				$(this).remove();
				
				// Update jsonObj and set record to inactive
				if (storageApi.localStorageSupported() ) {
					mynote.localDbSave();
					//console.log(localStorage.getItem("todoNotes-db"));
				} else {
					alert("Local Storage not supported on your current browser.  Please upgrade to Google Chrome.");
				}
			});
		});
	},
	localDbSave: function () {
		localStorage.setItem("todoNotes-db", JSON.stringify(mynote.todoNoteJsonObj));
	},
	eventListeners: function () {
		$("#input-to-do").on('keypress', function (event) {
			if (event.keyCode === 13) {
				var elementId = mynote.todoNoteJsonObj.length;
				var li = '<li class="span10 hide todos-element" id="todos-element-' + 
						elementId + 
						'"><label class="checkbox"><input type="checkbox" id="checkbox-' + 
						elementId + '">' + $(this).val() + 
						'</label><a class="destroy"></li>';
				$("#todo-list").append(li);
				$("#todo-list .todos-element").slideDown('medium');
						
				if (storageApi.localStorageSupported() ) {
					var todoObj = {
						id: mynote.todoNoteJsonObj.length,
						text: $(this).val(),
						complete: 0
					};
					mynote.todoNoteJsonObj.push(todoObj);
					mynote.localDbSave();
					//console.log(localStorage.getItem("todoNotes-db"));
				} else {
					alert("Local Storage not supported on your current browser.  Please upgrade to Google Chrome.");
				}
		
				mynote.todoEventListeners();
				return false;
			}
		});

		
		// Adding a new note
		$("#add-new-note").on('click', function () {
			// Show Progress
			progressDialog.show();
			
			var title = $("#new-note-title").val();
			var content = $("#new-note-content").val();
			$.ajax({
				url: "phprest.php",
				type:"POST",
				dataType: "json",
				data: {"title" : title, "content": content, token: fbUser.userID, "method": "addnote"},
				success: function(data) {
					if (data.Result.toUpperCase() === "SUCCESS") { 
						alert("You have submitted successfully!");
						
						progressDialog.hide();
						
						console.log(data);
						// Add new row - need row ID
						var id = data.Id;
						$("#all-notes").prepend('<div class="note-div span11"><h3>' + title + '<button id="note-update-' + id + '" class="btn btn-primary pull-right note-update">Update ' +
							title + '</button></h3><textarea id="note-' + id + '" class="span11" style="height:150px;">' + content + '</textarea></div>');
							
						// Rebind Event Listeners
						mynote.updateNote();
					} else {
						alert("Submission Failed");
					}
				}
			});
		});
		
		$("#update-schedule-text").on('click', function () {
			var scheduleText = $("#schedule-text").val();
			$.ajax({
				url: "phprest.php",
				type:"POST",
				dataType: "json",
				data: {"title" : "", "content": scheduleText, "token": fbUser.userID, "method": "updateschedule"},
				success: function(data) {
					if (data.Result.toUpperCase() === "SUCCESS") { 
						alert("You have submitted successfully!");
					} else {
						alert("Submission Failed");
					}
				}
			});
		});
		
		$("#update-to-learn-text").on('click', function () {
			var toLearnText = $("#to-learn-text").val();
			$.ajax({
				url: "phprest.php",
				type:"POST",
				dataType: "json",
				data: {"title" : "", "content": toLearnText, "token": fbUser.userID, "method": "updatetolearn"},
				success: function(data) {
					if (data.Result.toUpperCase() === "SUCCESS") { 
						alert("You have submitted successfully!");
					} else {
						alert("Submission Failed");
					}
				}
			});
		});
		
		// TO DO
		$("#sign-in").on('click', function () {
			var username = $("#login-username").val();
			var password = $("#login-password").val();
			$.ajax({
				url: "phprest.php",
				type:"POST",
				dataType: "json",
				data: {"title" : "", "content": content, "method": "signin"},
				success: function(data) {
					if (data.Result.toUpperCase() === "SUCCESS") { 
						alert("You have submitted successfully!");
					} else {
						alert("Submission Failed");
					}
				}
			});
		});
		
		// TO DO
		$("#register-user").on('click', function () {
			var username = $("#register-username").val();
			var password = $("#register-password").val();
			$.ajax({
				url: "phprest.php",
				type:"POST",
				dataType: "json",
				data: {"title" : "", "content": content, "method": "register"},
				success: function(data) {
					if (data.Result.toUpperCase() === "SUCCESS") { 
						alert("You have submitted successfully!");
					} else {
						alert("Submission Failed");
					}
				}
			});
		});
	},
	updateNote: function () {
		// To-DO:
		$(".note-update").on('click', function () {
			var id = $(this).attr('id').split('note-update-')[1];
			var content = $("#note-" + id).val();
						
			$.ajax({
				url: "phprest.php",
				type:"POST",
				dataType: "json",
				data: {"id" : id, "content": content, "token": fbUser.userID, "method": "updatenote"},
				success: function(data) {
					if (data.Result.toUpperCase() === "SUCCESS") { 
						alert("You have updated successfully!");
					} else {
						alert("Update Failed");
					}
				}
			});
		});
	},
	backboneModel: function () {

	},
	init: function () {
		mynote.getData();
		mynote.eventListeners();

	}
};

var storageApi = {
	localStorageSupported: function () {
		try {
			return "localStorage" in window && window["localStorage"] !== null;
		} catch (e) {
			return false;
		}
	}
};

var progressDialog = {
	height: 128,
	width: 128,
	show: function () {
		$("#modal-loading-img").css('left', ($(window).width()/2 - progressDialog.width/2));
		$("#modal-loading-img").css('top', ($(window).height()/2 - progressDialog.height/2));
		$("#modal-loading").show();
	},
	hide: function () {
		$("#modal-loading").hide();
	}
};

var fbUser = {userID: -1};