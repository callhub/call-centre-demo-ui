$(document).ready(function() {
	$('#loginmodal').modal({
		backdrop: 'static',
		keyboard: false,
		show: true
	});
	$('#loginbutton').click(function() {
		var username = $('#username').val();
		var password = $('#password').val();
		if(username && password) {
			console.log(username, password);
			$.ajax({
				url: 'https://api.callhub.io/v2/agent-key/',
				data: {
					username: username,
					password: password
				},
				method: 'POST'
			}).done(function(data) {
				token = data.token;
				$('#loginmodal').modal('hide');

				$.ajax({
					url: 'https://api.callhub.io/v2/agent-status/',
					method: 'GET',
					headers: {
						'Authorization': 'Token ' + token
					},
				}).done(function(data) {
					$('#agentstatus').text(JSON.stringify(data));
				});
			});
		}
	});

	$('#consoletabs a').click(function (e) {
		e.preventDefault()
		$(this).tab('show')
	});
});
