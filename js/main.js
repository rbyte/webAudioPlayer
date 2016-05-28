
const audioDir = "audio/"
var songListUl = document.getElementById("songList")
var player = document.getElementById("audio")
var activeTrack
var files

function XHR(phpFileToGet, callback) {
	var xhr = new XMLHttpRequest()
	xhr.onreadystatechange = function(e) {
		if (xhr.readyState == 4) {
			if (xhr.status !== 200) {
				console.log("error", xhr)
			} else {
				callback(xhr)
			}
		}
	}
	xhr.open("GET", phpFileToGet)
	xhr.send()
}

function playPause() {
	if (player.paused) {
		player.play()
	} else {
		player.pause()
	}
}

function setActiveTrack(file) {
	if (activeTrack)
		activeTrack.node.classList.remove("active")
	activeTrack = file
	file.node.classList.add("active")
	player.setAttribute("src", audioDir+file.name)
}

function playNext() {
	var idx = files.indexOf(activeTrack)
	console.assert(idx >= 0)
	if (idx < files.length-1)
		files[idx+1].play()
}

function init() {
	XHR("listFiles.php", function(xhr) {
		files = JSON.parse(xhr.responseText)
		files = files.filter(f => f.name.match(/\.(ogg|mp3|wave|wav|webm|m4a|aac|mp4)$/i))
		
		for (f of files) {
			var url = audioDir+f.name
			// preload ...
			f.audio = new Audio(url)
			f.play = function() {
				setActiveTrack(this)
				// onmetadataupdate?
				playPause()
			}
			var li = songListUl.appendChild(document.createElement("li"))
			var dlA = li.appendChild(document.createElement("a"))
			dlA.setAttribute("href", url)
			dlA.setAttribute("download", "")
			dlA.classList.add("dlA")
			var img = dlA.appendChild(document.createElement("img"))
			img.setAttribute("src", "downloadIcon_Differenz.svg")
			img.classList.add("dlIcon")
			var a = li.appendChild(document.createElement("a"))
			a.classList.add("playA")
			a.track = f
			f.node = a
			a.addEventListener("click", function(e) {
				this.track.play()
			})
			a.appendChild(document.createTextNode(f.name))
		}
		
		if (files.length > 0) {
			activeTrack = files[0]
			activeTrack.play()
		} else {
			console.log("error: no files found")
		}
	})
	
	document.body.addEventListener("keydown", function(e) {
		if (e.keyCode == 32 /*space*/) {
			playPause()
		}
	})
	
	player.addEventListener("ended", function() {
		playNext()
	})
	
	console.log("done")
}

init()
