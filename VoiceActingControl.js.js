/*:
 * @target MZ
 * @plugindesc 캐릭터 대사와 AI 보이스 (OGG 파일) 연동 플러그인
 * @author OtterScribe
 *
 * @command PlayVoice
 * @text 음성 재생
 * @desc 지정된 캐릭터 ID와 대사 ID에 맞는 음성을 재생합니다.
 *
 * @arg ActorID
 * @type number
 * @text 캐릭터 ID
 * @desc 음성을 재생할 캐릭터의 ID (예: 1)
 * @default 1
 *
 * @arg LineID
 * @type number
 * @text 대사 ID
 * @desc 대사에 맞는 음성 파일의 ID (예: 1)
 * @default 1
 *
 * @command StopVoice
 * @text 음성 중지
 * @desc 현재 재생 중인 음성을 중지합니다.
 *
 * @help
 * 이 플러그인은 캐릭터 대사와 OGG 형식의 AI 보이스 파일을 연동합니다.
 *
 * <사용법>
 * 1. AI 보이스를 OGG 형식으로 저장합니다.( 44.1kHz 파일이여야됩니다. )
 * 2. 파일을 "audio/se/" 폴더에 넣습니다.
 * 3. 파일명은 "ActorID_LineID.ogg" 형식으로 지정합니다. (예: 1_1.ogg)
 * 4. 이벤트에서 "플러그인 명령"을 사용합니다.
 *    - 예: PlayVoice ActorID:1 LineID:1
 * 5. 중지하려면 "StopVoice" 명령을 사용합니다.
 * 6. 플러그인 작동이 안될경우 스크립트로 직접입력해야합니다.
 * const audio = { name: "1_1", volume: 90, pitch: 100, pan: 0 };
AudioManager.playSe(audio);
 */

(() => {
    const pluginName = "VoiceActingControl";

    PluginManager.registerCommand(pluginName, "PlayVoice", args => {
        console.log("[VoiceActingControl] PlayVoice 명령이 호출됨");
        console.log("[VoiceActingControl] 받은 매개변수: ", args);

        const actorId = Number(args.ActorID);
        const lineId = Number(args.LineID);
        const fileName = `${actorId}_${lineId}`;

        if (!actorId || !lineId) {
            console.error("[VoiceActingControl] Error: ActorID 또는 LineID가 올바르지 않습니다.");
            return;
        }

        console.log(`[VoiceActingControl] 재생 시도: audio/se/${fileName}.ogg`);
        const audio = { name: fileName, volume: 90, pitch: 100, pan: 0 };
        AudioManager.playSe(audio);
        console.log(`[VoiceActingControl] Playing: audio/se/${fileName}.ogg`);
    });

    PluginManager.registerCommand(pluginName, "StopVoice", () => {
        console.log("[VoiceActingControl] StopVoice 명령 호출됨");
        AudioManager.stopSe();
        console.log("[VoiceActingControl] Voice stopped");
    });
})();