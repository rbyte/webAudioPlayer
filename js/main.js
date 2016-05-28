/*
 * Matthias Graf 2016
 * GNU AGPL v3
 * matthias.graf@mgrf.de
 * */

const audioDir = "audio/"
var table = document.getElementById("songList")
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

function toHHMMSS(durationInSeconds) {
	var hours = Math.floor(durationInSeconds / 60/60)
	var minutes = Math.floor((durationInSeconds - 60*60*hours) / 60)
	var seconds = Math.floor(durationInSeconds - 60*60*hours - 60*minutes)
	
	var result = ""
	if (hours > 0) {
		result += hours+":"
		result += ('00'+minutes).slice(-2)+":"
	} else {
		result += minutes+":"
	}
	result += ('00'+seconds).slice(-2)
	return result
}

function init() {
	XHR("listFiles.php", function(xhr) {
		files = JSON.parse(xhr.responseText)
		files = files.filter(f => f.name.match(/\.(ogg|mp3|wave|wav|webm|m4a|aac|mp4)$/i))
		
		for (f of files) {
			var url = audioDir+f.name
			var tr = table.appendChild(document.createElement("tr"))
			
			f.durationSpan = tr.appendChild(document.createElement("td"))
			f.durationSpan.classList.add("duration")
			
			var td2 = tr.appendChild(document.createElement("td"))
			var dlA = td2.appendChild(document.createElement("a"))
			dlA.setAttribute("href", url)
			dlA.setAttribute("download", "")
			dlA.classList.add("dlA")
			var img = dlA.appendChild(document.createElement("img"))
			img.setAttribute("src", "downloadIcon_Differenz.svg")
			img.classList.add("dlIcon")
			
			var td3 = tr.appendChild(document.createElement("td"))
			var a = td3.appendChild(document.createElement("a"))
			a.classList.add("playA")
			a.track = f
			f.node = a
			a.addEventListener("click", function(e) {
				this.track.play()
			})
			a.appendChild(document.createTextNode(f.name))
			
			f.play = function() {
				setActiveTrack(this)
				// onmetadataupdate?
				playPause()
			}
			
			// preload & metadata
			f.audio = new Audio(url)
			f.audio.track = f
			f.audio.addEventListener("loadedmetadata", function() {
				console.assert(this.duration > 0)
				this.track.durationSpan.appendChild(document.createTextNode(toHHMMSS(this.duration)))
			})
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
