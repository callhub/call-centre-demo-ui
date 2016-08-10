var token = '';
var conference_uuid = '';

function login() {
	var username = $('#username').val();
	var password = $('#password').val();
	if(username && password) {
		$.ajax({
			url: 'https://api.callhub.io/v2/agent-key/',
			data: {
				username: username,
				password: password
			},
			method: 'POST'
		}).done(function(data) {
			token = data.token;
			if(token) {
				$('#loginmodal').modal('hide');

				checkStatus();
				setInterval(checkStatus, 30000);

				allCampaignInformation();
			}
			else {
				$('#loginerror').removeClass('hide');
				$('#loginerror').text('Login Unsuccessful');
			}
		}).fail(function() {
			$('#loginerror').removeClass('hide');
			$('#loginerror').text('Login Unsuccessful');
		});
	}
}
function checkStatus() {
	$.ajax({
		url: 'https://api.callhub.io/v2/agent-status/',
		method: 'GET',
		headers: {
			'Authorization': 'Token ' + token
		},
	}).done(function(data) {
		var currentCampaign = '';
		if(data.connected_campaign) {
			if(data.call_uuid) {
				currentCampaign = '<strong>Currently joined to campaign</strong>: ' + data.connected_campaign;
			}
			else {
				currentCampaign = '<strong>Currently joining campaign</strong>: ' + data.connected_campaign;
			}
		}
		else {
			currentCampaign = '<strong>Not connected to a campaign</strong>';
		}

		var currentSubscriber = '';
		if(data.current_subscriber) {
			if(data.subscriber_uuid) {
				currentSubscriber = '<strong>Currently on call with subscriber</strong>: ' + data.current_subscriber;
			}
			else {
				currentSubscriber = '<strong>Currently calling subscriber</strong>: ' + data.current_subscriber;
			}
		}

		var currentSupervisor = '';
		if(data.supervisor_uuid) {
			currentSupervisor = '<strong>Currently connected to supervisor</strong>';
		}
		$('#agentstatus').html(currentCampaign + '<br />' + currentSubscriber + '<br />' + currentSupervisor);
	});
}

function getUserSettings() {
	$.ajax({
		url: 'https://api.callhub.io/v2/user-details/',
		headers: {
			'Authorization': 'Token ' + token
		},
		method: 'GET'
	}).done(function(data) {
		console.log('Agent Details: ', data);
	});
}

function allCampaignInformation() {
	$.ajax({
		url: 'https://api.callhub.io/v2/agent-campaigns/',
		method: 'GET',
		headers: {
			'Authorization': 'Token ' + token
		},
	}).done(function(data) {
		$.ajax({
			url: 'https://api.callhub.io/v2/campaign-info/?id=' + JSON.stringify(data.campaigns),
			method: 'GET',
			headers: {
				'Authorization': 'Token ' + token
			},
		}).done(function(data) {
			for(var i = 0; i < data.campaign_info.length; i++) {
				var campaignItem = '<li><a href="#" onclick="getCampaignInformation(' + data.campaign_info[i].id + ')">' + data.campaign_info[i].name + '</a></li>'
				$('#campaignlist').append(campaignItem);
			}
		});
	});
}

function getCampaignInformation(id) {
	$('#joincampaign').attr('onclick', 'joinCampaign(' + id + ')');
	var campaignarray = [id]
	$.ajax({
		url: 'https://api.callhub.io/v2/campaign-info/?id=' + JSON.stringify(campaignarray),
		method: 'GET',
		headers: {
			'Authorization': 'Token ' + token
		},
	}).done(function(data) {
		$('#campaignscript').html(data.campaign_info[0].script);
	});

	$.ajax({
		url: 'https://api.callhub.io/v2/script-sections/' + id + '/',
		method: 'GET',
		headers: {
			'Authorization': 'Token ' + token
		},
	}).done(function(data) {
		$('#campaignsurvey').text(JSON.stringify(data.script_sections));
	});
}

function joinCampaign(id) {
	$.ajax({
		url: 'https://api.callhub.io/v2/conference/',
		data: {
			campaign_id: id
		},
		headers: {
			'Authorization': 'Token ' + token
		},
		method: 'POST'
	}).done(function(data) {
		console.log('Conference created successfully');
		conference_uuid = data.conference_uuid;
		$.ajax({
			url: 'https://euler.callhub.io/v2/conference/' + conference_uuid + '/agent/',
			data: {
				'endpoint': 'PHONE'
			},
			headers: {
				'Authorization': 'Token ' + token
			},
			method: 'PUT'
		}).done(function(data) {
			$('#joincampaign').attr('onclick', 'leaveCampaign(' + id + ')');
			$('#joincampaign').text('Leave Campaign');
			console.log('Agent joined Successfully');
		}).fail(function(error) {

		});
	});
}

function leaveCampaign(id) {
	$.ajax({
		url: 'https://euler.callhub.io/v2/conference/' + conference_uuid + '/agent/',
		headers: {
			'Authorization': 'Token ' + token
		},
		method: 'DELETE'
	}).done(function(data) {
		$('#joincampaign').attr('onclick', 'joinCampaign(' + id + ')');
		$('#joincampaign').text('Join Campaign');
		console.log('Agent left Campaign Successfully');
	}).fail(function(error) {

	});
}

$(document).ready(function() {
	$('#loginmodal').modal({
		backdrop: 'static',
		keyboard: false,
		show: true
	});
	$('#loginbutton').click(login);
	$("#loginform").submit(function(e) {
		e.preventDefault();
	});

	$('#consoletabs a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	});
});
