/*:
 * @target MZ
 * @plugindesc NW.js 기반 게임 창과 캔버스 해상도를 유연하게 조절하는 플러그인 (GUI 명령 지원)
 * @author Otterscribe
 *
 * @param DefaultWidth
 * @type number
 * @desc 기본 창 너비 (픽셀)
 * @default 1280
 *
 * @param DefaultHeight
 * @type number
 * @desc 기본 창 높이 (픽셀)
 * @default 720
 *
 * @command ChangeResolution
 * @text 해상도 변경
 * @desc 지정한 해상도로 게임 창과 캔버스 크기를 변경합니다.
 *
 * @arg width
 * @type number
 * @desc 변경할 창 너비 (픽셀)
 * @default 1280
 *
 * @arg height
 * @type number
 * @desc 변경할 창 높이 (픽셀)
 * @default 720
 *
 * @help
 * 이 플러그인은 단순한 코드 그 이상입니다. NW.js의 숨겨진 힘을 끌어내어,
 * 게임 창과 내부 캔버스의 해상도를 마치 마법처럼 바꿉니다.
 * 
 * 사용법:
 * 1. 이 파일을 js/plugins/ 폴더에 "ChangeWindowResolutionMZ.js"로 저장하고 활성화하세요.
 * 2. 이벤트에서 "플러그인 명령"을 추가하여 "해상도 변경"을 선택한 후,
 *    원하는 너비와 높이를 입력하면 NW.js 환경에서 즉시 반영됩니다.
 * 3. 게임 실행 시, 지정한 해상도로 창과 캔버스가 새로운 모습으로 탄생합니다.
 *
 * 주의:
 * - 이 플러그인은 NW.js 환경 전용입니다. NW.js가 아닌 환경에서는 Graphics.resize()만 호출되어
 *   캔버스 해상도만 변경될 수 있습니다.
 * - 운영체제별로 창 크기 조정에 제약이 있을 수 있으므로, 사용 전 반드시 충분한 테스트를 진행하세요.
 * - 코드 수정 및 배포 시 발생하는 모든 문제에 대해 스스로 검토 및 해결하는 책임이 따릅니다.
 *
 * 당신의 게임 창과 캔버스가 새로운 해상도의 꿈을 이루길 바랍니다.
 */

(() => {
    "use strict";
    const parameters = PluginManager.parameters("ChangeWindowResolutionMZ");
    const defaultWidth = Number(parameters["DefaultWidth"] || 1280);
    const defaultHeight = Number(parameters["DefaultHeight"] || 720);

    function changeResolution(width, height) {
        // 내부 캔버스 해상도 변경
        Graphics.resize(width, height);
        // NW.js 환경이면 실제 창 크기도 변경
        if (Utils.isNwjs()) {
            const win = nw.Window.get();
            win.resizeTo(width, height);
        }
    }

    PluginManager.registerCommand("ChangeWindowResolutionMZ", "ChangeResolution", args => {
        const width = Number(args.width || defaultWidth);
        const height = Number(args.height || defaultHeight);
        changeResolution(width, height);
    });

    // 스크립트 명령으로도 호출 가능하도록 전역 등록
    window.changeWindowResolution = changeResolution;
})();
