<?php

$dir = "audio/";

function getFiles() {
	global $dir;
	$files = [];
	foreach (scandir($dir) as $id => $filename) {
		// exclude directories and hidden files (like .htaccess and .keep)
		if (!is_dir($dir.$filename) && $filename[0] !== '.') {
			// may produce: Warning: filesize(): stat failed
			// @ suppresses Warning
			 $size = @filesize($dir.$filename);
			// append
			$files[] = array('name' => $filename, 'size' => ($size === false ? 0 : $size));
		}
	}
	return $files;
}

if (!debug_backtrace()) {
	echo json_encode(getFiles());
}

