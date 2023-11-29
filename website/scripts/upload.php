<html>
<body>
<?php
$info = pathinfo($_FILES['audioFileInput']['name']);
$ext = $info['extension']; // get the extension of the file
$newname = "sample.".$ext; 

$target = 'images/'.$newname;
if(move_uploaded_file( $_FILES['audioFileInput']['tmp_name'], $target)) {
    echo "<p>The file ".  basename( $_FILES['userFile']['name']). 
    " has been uploaded</p>";
} else{
    echo "<b>There was an error uploading the file, please try again!</b>";
}
?>
</body>
</html>
