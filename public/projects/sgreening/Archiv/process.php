<?php
if (isset($_POST['g-recaptcha-response'])){
$captcha=$_POST['g-recaptcha-response'];
$secret = "6LdcZzEUAAAAAEWHOsxTLhF0dAXbbprX-MklhXPC";
$response=file_get_contents("https://www.google.com/recaptcha/api/siteverify?secret=".$secret."&response=".$captcha."&remoteip=".$_SERVER['REMOTE_ADDR']);
$obj = json_decode($response);
if($obj->success == true)
{
	$myemail = 'greeningschool@gmail.com';
	// mehrere Empfänger 
	$to  = 'dominik.turner@htl.rennweg.at' . ', '; // note the comma 
	$to .= 'fabian.steiner@htl.rennweg.at'; 

	// Betreff 
	$subject = $_POST['subject']; 

	// Nachricht 
	$message = ' 
	<html> 
	<head> 
	  <title>Message from '.$_POST["name"].'</title> 
	</head> 
	<body> 
		<h4>Nachricht von '.$_POST["name"].':</h4><br><br>
	  '.nl2br($_POST['message']).'
	</body> 
	</html> 
	'; 

	// Um HTML Mails zu versenden, muss der Content Type gesetzt sein 
	$headers  = 'MIME-Version: 1.0' . "\r\n"; 
	$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n"; 

	// Additional headers
	$headers .= 'From: SGREENING <greeningschool@gmail.com>' . "\r\n";
	$headers .= "Reply-To: ".$_POST['email'];

	// Mail it 
	mail($to, $subject, $message, $headers);
	if(isset($_POST["kopie"])){
		$headers  = 'MIME-Version: 1.0' . "\r\n"; 
		$headers .= 'Content-type: text/html; charset=utf-8' . "\r\n"; 

	// Additional headers
		$headers .= 'From: SGREENING <greeningschool@gmail.com>' . "\r\n";
		$subject = "Ihre Nachricht an SGREENING: ".$subject;
		$message = ' 
	<html> 
	<head> 
	  <title>Ihre Nachricht an SGREENING</title> 
	</head> 
	<body> 
		<h4>Ihre Nachricht an SGREENING:</h4><br><br>
	  '.nl2br($_POST['message']).'
	</body> 
	</html> 
	'; 
		mail($_POST['email'],$subject, $message, $headers);
	}
	header("location: index.php");
}
else
{
	print "<script>alert('You are not a human');</script>;";
	sleep(10);
	header("location: index.php");
}
}
else
{
	print "<script>alert('You are not a human');</script>;";
	sleep(10);
	header("location: index.php");
}
?>