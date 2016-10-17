<?php
	// Global Object
	$server = "localhost";
	$user = "garretu2";	//garretu2
	$pass = "tYcq7ae$";	// tYcq7ae$
	$database = "garretu2_mynote";	// garretu2_mynote
	session_start();

function get_data ($mysqli) {
	$user_id = isset($_GET["token"]) ? $_GET['token'] : -1;
	
	// Gets all Notes
	$query = "SELECT * FROM notes n WHERE section='GENERAL' and user_id = '$user_id' ORDER BY n.id DESC";

	$stmt = $mysqli->prepare($query);
		
	if ( false===$stmt ) {
		// and since all the following operations need a valid/ready statement object
		// it doesn't make sense to go on
		// you might want to use a more sophisticated mechanism than die()
		// but's it's only an example
		die('prepare() failed: ' . htmlspecialchars($mysqli->error));
	}

	
	/* execute statement */
	$stmt->execute();

	/* bind result variables */
	$stmt->bind_result($id, $userid, $section, $title, $content, $date, $username);

	$result = array();
	$notes = array();
	$schedule = array();
	$tolearn = array();
	/* fetch values */
	while ($stmt->fetch()) {
		array_push($notes, array("id" => $id, "name" => $userid, "title" => $title, "content" => $content, "date" => $date));
	}
	$result["notes"] = $notes;
	
	$query = "SELECT * FROM notes n WHERE section='SCHEDULE' and user_id = '$user_id' ORDER BY n.id DESC LIMIT 1";

	$stmt = $mysqli->prepare($query);
		
	if ( false===$stmt ) {
		// and since all the following operations need a valid/ready statement object
		// it doesn't make sense to go on
		// you might want to use a more sophisticated mechanism than die()
		// but's it's only an example
		die('prepare() failed: ' . htmlspecialchars($mysqli->error));
	}	
	$stmt->execute();
	$stmt->bind_result($id, $userid, $section, $title, $content, $date, $username);
	while ($stmt->fetch()) {
		array_push($schedule, array("id" => $id, "name" => $userid, "title" => $title, "content" => $content, "date" => $date));
	}
	$result["schedule"] = $schedule;
	
	$query = "SELECT * FROM notes n WHERE section='TO_LEARN' and user_id = '$user_id'  ORDER BY n.id DESC LIMIT 1";

	$stmt = $mysqli->prepare($query);
		
	if ( false===$stmt ) {
		// and since all the following operations need a valid/ready statement object
		// it doesn't make sense to go on
		// you might want to use a more sophisticated mechanism than die()
		// but's it's only an example
		die('prepare() failed: ' . htmlspecialchars($mysqli->error));
	}	
	$stmt->execute();
	$stmt->bind_result($id, $userid, $section, $title, $content, $date, $username);
	while ($stmt->fetch()) {
		array_push($tolearn, array("id" => $id, "name" => $userid, "title" => $title, "content" => $content, "date" => $date));
	}
	$result["tolearn"] = $tolearn;
	
	/* close statement */
	$stmt->close();
	
	/* close connection */
	$mysqli->close();
	
	exit(json_encode($result));
}

// INSERT / UPDATE
function add_note ($mysqli){
	$title = stripslashes(strip_these_tags($_POST["title"]));
	$content = nl2br(addslashes($_POST["content"]));
	$user_id = isset($_POST["token"]) ? $_POST['token'] : -1;
	$username = isset($_SESSION["username"]) ? $_SESSION['username'] : "Anonymous";
	
	$query = "INSERT INTO notes (user_id, section, title, content, date, username) VALUES ('$user_id', 'GENERAL', '$title', '$content', NOW(), '$username')";

	$result = $mysqli->query($query);
	$id = $mysqli->insert_id;
	if (!$result) {
		printf("%s\n", $mysqli->error);
		$result = array("Result" => "Failed", "Code" => $result);
	} else {			
		$result = array("Result" => "Success", "Code" => $result, "Id" => $id);
	}
	
	$mysqli->close();
	
	exit(json_encode($result));
}

function update_note ($mysqli) {
	$id = stripslashes(strip_these_tags($_POST["id"]));
	$content = nl2br(addslashes($_POST["content"]));
	$user_id = isset($_POST["token"]) ? $_POST['token'] : -1;
	$username = isset($_SESSION["username"]) ? $_SESSION['username'] : "Anonymous";	
	$query = "UPDATE notes SET content = '$content' WHERE id = '$id' and user_id = '$user_id'";

	$result = $mysqli->query($query);
	if (!$result) {
		printf("%s\n", $mysqli->error);
		$result = array("Result" => "Failed", "Code" => $result);
	} else {			
		$result = array("Result" => "Success", "Code" => $result);
	}
					
	$mysqli->close();
	
	exit(json_encode($result));
}

function update_schedule ($mysqli) {
	$title = stripslashes(strip_these_tags($_POST["title"]));
	$content = nl2br(addslashes($_POST["content"]));
	$user_id = isset($_POST["token"]) ? $_POST['token'] : -1;
	$username = isset($_SESSION["username"]) ? $_SESSION['username'] : "Anonymous";	
	$query = "INSERT INTO notes (user_id, section, title, content, date, username) VALUES ('$user_id', 'SCHEDULE', '$title', '$content', NOW(), '$username')";

	$result = $mysqli->query($query);
	if (!$result) {
		printf("%s\n", $mysqli->error);
		$result = array("Result" => "Failed", "Code" => $result);
	} else {			
		$result = array("Result" => "Success", "Code" => $result);
	}
					
	$mysqli->close();
	
	exit(json_encode($result));
}

function update_to_learn ($mysqli) {
	$title = stripslashes(strip_these_tags($_POST["title"]));
	$content = nl2br(addslashes($_POST["content"]));
	$user_id = isset($_POST["token"]) ? $_POST['token'] : -1;
	$username = isset($_SESSION["username"]) ? $_SESSION['username'] : "Anonymous";
	$query = "INSERT INTO notes (user_id, section, title, content, date, username) VALUES ('$user_id', 'TO_LEARN', '$title', '$content', NOW(), '$username')";

	$result = $mysqli->query($query);
	if (!$result) {
		printf("%s\n", $mysqli->error);
		$result = array("Result" => "Failed", "Code" => $result);
	} else {			
		$result = array("Result" => "Success", "Code" => $result);
	}
					
	$mysqli->close();
	
	exit(json_encode($result));
}

function user_management ($mysqli) {
	$user_id = stripslashes(strip_these_tags($_POST["token"]));
	$name = stripslashes($_POST["name"]);
	
	// Check if user already exists
	$query = "REPLACE INTO users SET user_id = '$user_id', name = '$name', last_access = NOW()";

	$result = $mysqli->query($query);
	if (!$result) {
		$result = array("Result" => "Failed", "Code" => $mysqli->error);
	} else {			
		$result = array("Result" => "Success", "Code" => $result);
	}
					
	$mysqli->close();
	
	exit(json_encode($result));
}

function validate_user () {
	$id = strip_tags($_POST["id"]);
	
	$query = "SELECT user_id, min(score) score FROM  scores GROUP BY user_id order by score";

	$stmt = $mysqli->prepare($query);
		
	if ( false===$stmt ) {
		// and since all the following operations need a valid/ready statement object
		// it doesn't make sense to go on
		// you might want to use a more sophisticated mechanism than die()
		// but's it's only an example
		die('prepare() failed: ' . htmlspecialchars($mysqli->error));
	}
	
	/* execute statement */
	$stmt->execute();

	/* bind result variables */
	$stmt->bind_result($name, $score);

	$scores = array();
	/* fetch values */
	while ($stmt->fetch()) {
		array_push($scores, array("name" => $name, "score" => $score));
	}

	/* close statement */
	$stmt->close();
	
	/* close connection */
	$mysqli->close();
	
	exit(json_encode($scores));
}

function strip_these_tags($content)
{
	return strip_tags($content, 
		'
		<script><style><html><head><meta><body><div><table><tr><td><p><select><option>
		<asp:Button><asp:Image><asp:ImageButton><textarea><asp:Literal><asp><img>
		
		');
}
	
// MAIN METHOD

// Connect
$mysqli = new mysqli("$server", "$user", "$pass", "$database");
if (mysqli_connect_errno()) {
	printf("Connect failed: %s\n", mysqli_connect_error());
	exit();
}
	
if(isset($_POST["method"])) {
	switch (strtoupper($_POST["method"])) {
		case "ADDNOTE":
			add_note($mysqli);
			break;
		case "UPDATENOTE":
			update_note($mysqli);
			break;
		case "UPDATESCHEDULE":
			update_schedule($mysqli);
			break;
		case "UPDATETOLEARN":
			update_to_learn($mysqli);
			break;
		case "USERMANAGEMENT":
			user_management($mysqli);
			break;
	}
} else if (isset($_POST["method"])) {
	switch (strtoupper($_POST["method"])) {
		case "GETSCORES":
			get_scores();
			break;
	}
} else if (isset($_GET["method"])) {
	get_data($mysqli);
}
else {
	echo "{Status: Busy}";
}
?>