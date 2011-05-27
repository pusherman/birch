<?php 

$birch_server = 'some.host.com:8090';
$encrypt_key = '29fh1kjf23f9fjafj93f9afa';


$string = $_GET['user'];
$nick = strip_tags($_GET['user']);
$method = 'des-ede3-cbc';

//append our hmac
$string .= hash_hmac('sha1', $string, $encrypt_key);

// encrypt our message (node.js has an bug when encrypting as base64
// so we have to convert it to hex for now
$iv = substr(bin2hex(mcrypt_create_iv(openssl_cipher_iv_length($method))), 8);
$enc = openssl_encrypt($string, $method, $encrypt_key, false, $iv);
$hex_enc = bin2hex(base64_decode($enc));

?>
<!DOCTYPE html> 
<html lang="en"> 
<head> 
  <meta charset="UTF-8" /> 
  <meta http-equiv="Content-type" content="text/html; charset=UTF-8" /> 
  <meta http-equiv="Content-Language" content="en-us" /> 
  
  <title>birch</title> 
  <script type="text/javascript" src="http://ajax.googleapis.com/ajax/libs/jquery/1.5.1/jquery.min.js"></script> 
  <script type="text/javascript" src="http://<?php echo $birch_server ?>/socket.io/socket.io.js"></script> 
  <script type="text/javascript" src="js/birch.js"></script> 
  <link rel="stylesheet" type="text/css" href="css/reset.css" media="screen" /> 
  <link rel="stylesheet" type="text/css" href="css/birch.css" media="screen" /> 
</head> 
 
<body> 
 
<div id="overlay"> 
  <div><span style="font-size:20px">connecting...</span></div> 
</div> 
 
<div id="container"> 
  <div id="userlist"> 
    <ul id="users"></ul> 
  </div> 
  <div id="chatterbox"> 
    <div id="chats" />
  </div> 
</div> 
 
<div id="chatbox"> 
  <input type="text" id="words" value="service current unavailable..." disabled /> 
  <button id="send" disabled>Speak</button> 
</div> 
 
<input type="hidden" id="hilight" value="<?php echo $nick; ?>" /> 
<input type="hidden" id="auth" value="<?php echo $hex_enc; ?>" /> 
<input type="hidden" id="iv" value="<?php echo $iv; ?>" /> 
</body> 
</html> 
 
