import './style.css'
import AgoraRTC from 'agora-rtc-sdk-ng'
import appid from './\bappId'

const token = null
const rtcUid =  Math.floor(Math.random() * 2032)

let roomId = "main"

let audioTracks = {
  localAudioTrack: null,
  remoteAudioTracks: {},
};

let rtcClient;

// 1. RTC client 초기화 , Channel 참가 -> createClient, Join
// 2. MIC Audio Track Getting -> createMicrophoneAudioTrack
// 3. 유저참가, 비공개, 떠나기 function

const initRtc = async () => {
    rtcClient = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
    rtcClient.on('user-joined', handleUserJoined)
    
    await rtcClient.join(appid, roomId, token, rtcUid)
  
    audioTracks.localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    await rtcClient.publish(audioTracks.localAudioTrack);
  
    document.getElementById('members').insertAdjacentHTML('beforeend', `<div class="speaker user-rtc-${rtcUid}" id="${rtcUid}"><p>${rtcUid}</p></div>`)

    rtcClient.on('user-joined', handleUserJoined)
    rtcClient.on("user-published", handleUserPublished)
    rtcClient.on("user-left", handleUserLeft);
  }

  let lobbyForm = document.getElementById('form')

  // Enter Room

const enterRoom = async (e) => {
  e.preventDefault()
  initRtc()

  lobbyForm.style.display = 'none'
  document.getElementById('room-header').style.display = "flex"
}

lobbyForm.addEventListener('submit', enterRoom)

// Leave Room
// 1. Track 끄기, 멈추기 -> Stop, Close
// 2. Track 비공개, 채널 떠나기 -> unpublish, leave

let leaveRoom = async () => {
    //1
    audioTracks.localAudioTrack.stop()
    audioTracks.localAudioTrack.close()
  
    //2
    rtcClient.unpublish()
    rtcClient.leave()
  
    //3
    document.getElementById('form').style.display = 'block'
    document.getElementById('room-header').style.display = 'none'
    document.getElementById('members').innerHTML = ''
  }
  
  document.getElementById('leave-icon').addEventListener('click', leaveRoom)

  //1. 새로운 유저 가입시 시작
  // console.log("USER:", user)개체를 확인
  let handleUserJoined = async (user) => {
    //2. 새로운 HTML 요소를 생성하고 DOM에 추가하면 합류한 사용자를 시각적으로 표현
    document.getElementById('members').insertAdjacentHTML('beforeend', `<div class="speaker user-rtc-${user.uid}" id="${user.uid}"><p>${user.uid}</p></div>`)
  } 
  
  //3. handleUserPublished원격 사용자가 오디오 및/또는 비디오 트랙을 게시하면 실행
  let handleUserPublished = async (user, mediaType) => {
    //4. 유저 미디어 구독 메서드
    await  rtcClient.subscribe(user, mediaType);
    
    //5
    if (mediaType == "audio"){
      audioTracks.remoteAudioTracks[user.uid] = [user.audioTrack]
      user.audioTrack.play();
    }
  }
  
  //6. HTML 요소에 전달한 특정 사용자 ID로 DOM에서 사용자로 특정
  let handleUserLeft = async (user) => {
    delete audioTracks.remoteAudioTracks[user.uid]
    document.getElementById(user.uid).remove()
  }