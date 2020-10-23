export default function turnOffCamera () {
    const video = document.getElementById('video_element');
    if(video) {
        const mediaStream = video.srcObject;
        const tracks = mediaStream.getTracks();
        tracks[0].stop();
        tracks.forEach(track => track.stop()); 
    }
}