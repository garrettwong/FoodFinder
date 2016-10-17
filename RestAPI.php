<?php
	# PHP REST API

	// Global Object
	$server = "localhost";
	$user = "garretu2_cs212";
	$pass = "cs212cs212";
	$database = "garretu2_cs212";
	session_start();

#
#	Create
#
function AddReview ($mysqli) {
	$restaurantId = stripslashes(SanitizeInput($_POST["restaurantId"]));
	$price = stripslashes(SanitizeInput($_POST["price"]));
	$noise = stripslashes(SanitizeInput($_POST["noise"]));
	$imageURL = stripslashes(SanitizeInput($_POST["imageURL"]));
	$review = nl2br(addslashes($_POST["review"]));

	$query = "insert into reviews (restaurant_id, price, noise, imageURL, review) values ('$restaurantId', '$price', '$noise', '$imageURL', '$review')";
	
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
function AddMultimedia ($mysqli) {
	$query = "insert into multimedia (name, restaurant_id, url) values ('Cupcake', 1, 'http://cupcake.com')";
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

function AddCategory ($mysqli){
	$name = stripslashes(SanitizeInput($_POST["name"]));
	
	$query = "INSERT INTO categories (name) VALUES ('$name')";

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

function AddRestaurant ($mysqli){
	$name = stripslashes(SanitizeInput($_POST["name"]));
	$location = stripslashes(SanitizeInput($_POST["location"]));
	
	$query = "INSERT INTO restaurant (name, location) VALUES ('$name', '$location')";

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


#
#	Retrieve
#
function GetMultimedia ($mysqli) {
	$query = "SELECT * FROM multimedia m";
	$stmt = $mysqli->prepare($query);
		
	if ( false===$stmt ) {
		die('prepare() failed: ' . htmlspecialchars($mysqli->error));
	}
	$stmt->execute();

	$stmt->bind_result($id, $name, $restaurantId, $timestamp, $url);

	$result = array();
	$multimedia = array();

	/* fetch values */
	while ($stmt->fetch()) {
		array_push($multimedia, array("id" => $id, "name" => $name, "restaurantId" => $restaurantId, "url" => $url));
	}

	/* close statement */
	$stmt->close();
	
	/* close connection */
	$mysqli->close();
	
	exit(json_encode($multimedia));
}
function GetCategories ($mysqli) 
{
	$query = "SELECT * FROM category c";
	$stmt = $mysqli->prepare($query);
		
	if ( false===$stmt ) {
		die('prepare() failed: ' . htmlspecialchars($mysqli->error));
	}
	$stmt->execute();

	$stmt->bind_result($id, $name);

	$result = array();
	$categories = array();

	/* fetch values */
	while ($stmt->fetch()) {
		array_push($categories, array("id" => $id, "name" => $name));
	}

	/* close statement */
	$stmt->close();
	
	/* close connection */
	$mysqli->close();
	
	exit(json_encode($categories));
}
function GetRestaurants ($mysqli) 
{
	$query = "SELECT * FROM restaurant r";
	$stmt = $mysqli->prepare($query);
		
	if ( false===$stmt ) {
		die('prepare() failed: ' . htmlspecialchars($mysqli->error));
	}
	$stmt->execute();

	$stmt->bind_result($id, $name, $location);

	$result = array();
	$restaurants = array();

	/* fetch values */
	while ($stmt->fetch()) {
		array_push($restaurants, array("id" => $id, "name" => $name, "location" => $location));
	}

	/* close statement */
	$stmt->close();
	
	/* close connection */
	$mysqli->close();
	
	exit(json_encode($restaurants));
}

function SanitizeInput($input)
{
	return strip_tags($input, '<script><style><html><head><meta><body><img>');
}



#
# 	Service Entrypoint
#

# Let's make this easier by allowing anyone to connect to this API... Shhhh
header("Access-Control-Allow-Origin: *");

#	Open Connection to mysqli
$mysqli = new mysqli("$server", "$user", "$pass", "$database");
if (mysqli_connect_errno()) {
	printf("Connect failed: %s\n", mysqli_connect_error());
	exit();
}

# Look for Protocol and Method Request

# Create
if(isset($_POST["method"])) 
{
	switch ($_POST["method"]) 
	{
		case "AddReview":
			AddReview($mysqli);
			break;

		default:
			break;
	}
}
# Retrieve
else if (isset($_GET["method"])) 
{
	switch (($_GET["method"])) 
	{
		#Multimedia Specific
		case "AddReview":
			echo "Invalid";
			break;

		case "GetMultimedia":
			GetMultimedia($mysqli);	
			break;

		#Category Specific
		case "GetCategories":
			GetCategories($mysqli);
			break;

		#Restaurant Specific
		case "GetRestaurants":
			GetRestaurants($mysqli);
			break;

		#User Specific

		default:
			break;
	}
}
# Update
# Delete
#NONE
else {
	echo "{Status: 'Invalid Method'}";
}

?>