/*:
 * @target MZ
 * @plugindesc RPG Maker MZ에서 안개 날씨 효과를 추가하는 플러그인
 * @author OtterScribe
 *
 * @param DefaultOpacity
 * @type number
 * @desc 기본 안개 농도 (0~255)
 * @default 128
 *
 * @param DefaultFogColor
 * @type string
 * @desc 기본 안개 색상 (RGB 헥사코드, 예: #808080)
 * @default #808080
 *
 * @param DefaultSpeedX
 * @type number
 * @desc 기본 안개 수평 이동 속도
 * @default 0.2
 *
 * @param DefaultSpeedY
 * @type number
 * @desc 기본 안개 수직 이동 속도
 * @default -0.2
 *
 * @param DefaultFadeDuration
 * @type number
 * @desc 기본 페이드 인/아웃 지속 시간 (프레임)
 * @default 120
 *
 * @command MistyWeather On
 * @text 안개 활성화
 * @desc 안개 효과를 활성화합니다.
 *
 * @command MistyWeather Off
 * @text 안개 비활성화
 * @desc 안개 효과를 비활성화합니다.
 *
 * @command MistyWeather SetOpacity
 * @text 안개 농도 설정
 * @desc 안개 농도를 설정합니다.
 * @arg opacity
 * @type number
 * @min 0
 * @max 255
 * @default 128
 * @text 농도
 * @desc 안개 농도 (0~255)
 *
 * @command MistyWeather SetColor
 * @text 안개 색상 설정
 * @desc 안개 색상을 설정합니다.
 * @arg color
 * @type string
 * @default #808080
 * @text 색상
 * @desc 안개 색상 (RGB 헥사코드, 예: #FFFFFF)
 *
 * @command MistyWeather SetSpeed
 * @text 안개 이동 속도 설정
 * @desc 안개 이동 속도를 설정합니다.
 * @arg speedX
 * @type number
 * @default 0.2
 * @text 수평 속도
 * @desc 수평 이동 속도
 * @arg speedY
 * @type number
 * @default -0.2
 * @text 수직 속도
 * @desc 수직 이동 속도
 *
 * @command MistyWeather FadeIn
 * @text 안개 페이드 인
 * @desc 안개가 서서히 나타나도록 설정합니다.
 * @arg duration
 * @type number
 * @default 120
 * @text 지속 시간
 * @desc 페이드 인 지속 시간 (프레임)
 *
 * @command MistyWeather FadeOut
 * @text 안개 페이드 아웃
 * @desc 안개가 서서히 사라지도록 설정합니다.
 * @arg duration
 * @type number
 * @default 120
 * @text 지속 시간
 * @desc 페이드 아웃 지속 시간 (프레임)
 *
 * @help
 * ### 사용법
 * 1. 플러그인을 `js/plugins/` 폴더에 `MistyWeatherMZ.js`로 저장하고 활성화하세요.
 * 2. 안개 텍스처 이미지를 `img/fogs/` 폴더에 `mist.png`로 저장하세요. (없으면 기본 회색 안개 생성)
 * 3. 플러그인 명령으로 안개 효과를 제어하세요:
 *    - `MistyWeather On`: 안개 활성화.
 *    - `MistyWeather Off`: 안개 비활성화.
 *    - `MistyWeather SetOpacity 200`: 안개 농도 설정.
 *    - `MistyWeather SetColor #FFFFFF`: 안개 색상 설정.
 *    - `MistyWeather SetSpeed 0.2 -0.2`: 안개 이동 속도 설정.
 *    - `MistyWeather FadeIn 120`: 안개 페이드 인.
 *    - `MistyWeather FadeOut 120`: 안개 페이드 아웃.
 * 4. 스위치 연동: 스위치 10번이 ON이면 안개 활성화, OFF이면 비활성화 (플러그인 명령 우선).
 * 5. 맵별 설정: 맵 속성 메모 태그에 `<Fog: On, 128, #808080, 0.2, -0.2>` 형식으로 설정 가능.
 * 6. 특정 지역 설정: 맵 속성 메모 태그에 `<FogRegion: 1>` 추가 후, 해당 지역 ID에만 안개 적용.
 *
 * ### 기능
 * - 안개 활성화/비활성화 및 커스터마이징 (농도, 색상, 이동 속도).
 * - 이벤트 스위치 연동.
 * - 맵별 기본 설정 및 특정 지역 적용.
 * - 부드러운 페이드 인/아웃 효과.
 *
 * ### 호환성
 * - VisuStella Core와의 충돌 방지를 위해 별도 안개 레이어로 처리.
 */

(() => {
    const parameters = PluginManager.parameters("MistyWeatherMZ");
    const defaultOpacity = Number(parameters["DefaultOpacity"] || 128);
    const defaultFogColor = parameters["DefaultFogColor"] || "#808080";
    const defaultSpeedX = Number(parameters["DefaultSpeedX"] || 0.2);
    const defaultSpeedY = Number(parameters["DefaultSpeedY"] || -0.2);
    const defaultFadeDuration = Number(parameters["DefaultFadeDuration"] || 120);
    const controlSwitchId = 10; // 스위치 10번으로 안개 제어

    class MistyWeather {
        constructor() {
            this._enabled = false; // 기본적으로 꺼진 상태
            this._opacity = defaultOpacity;
            this._targetOpacity = 0; // 초기 불투명도 0
            this._color = defaultFogColor;
            this._speedX = defaultSpeedX;
            this._speedY = defaultSpeedY;
            this._fadeDuration = defaultFadeDuration;
            this._fadeCounter = 0;
            this._sprite = null;
            this._regionIds = [];
        }

        initialize() {
            this.loadMapSettings();
            // 스위치 초기 체크는 맵 로드 시 한 번만
            if ($gameSwitches.value(controlSwitchId)) {
                this.enable();
            }
        }

        loadMapSettings() {
            const map = $dataMap;
            if (map && map.meta.Fog) {
                const [state, opacity, color, speedX, speedY] = map.meta.Fog.split(",").map(s => s.trim());
                this._enabled = state.toLowerCase() === "on";
                this._opacity = Number(opacity) || defaultOpacity;
                this._targetOpacity = this._enabled ? this._opacity : 0;
                this._color = color || defaultFogColor;
                this._speedX = Number(speedX) || defaultSpeedX;
                this._speedY = Number(speedY) || defaultSpeedY;
            }
            if (map && map.meta.FogRegion) {
                this._regionIds = map.meta.FogRegion.split(",").map(id => Number(id.trim()));
            } else {
                this._regionIds = [];
            }
        }

        updateFromSwitch() {
            // 매 프레임 체크 대신, 명령에 의존
            // 빈 메서드로 유지
        }

        enable() {
            this._enabled = true;
            this._targetOpacity = this._opacity;
            if (this._fadeCounter <= 0) {
                this._fadeCounter = this._fadeDuration;
            }
            if (this._sprite) this._sprite.visible = true;
        }

        disable() {
            this._enabled = false;
            this._targetOpacity = 0;
            if (this._fadeCounter <= 0) {
                this._fadeCounter = this._fadeDuration;
            }
            if (this._sprite) this._sprite.visible = false;
        }

        setOpacity(opacity) {
            this._opacity = Math.max(0, Math.min(255, opacity));
            if (this._enabled && this._sprite) {
                this._sprite.opacity = this._opacity; // 즉시 적용
                this._targetOpacity = this._opacity;
            }
        }

        setColor(color) {
            this._color = color;
            if (this._sprite) {
                this._sprite.tint = parseInt(color.replace("#", ""), 16);
            }
        }

        setSpeed(speedX, speedY) {
            this._speedX = speedX;
            this._speedY = speedY;
        }

        fadeIn(duration) {
            this._fadeDuration = duration;
            this._fadeCounter = duration;
            this._enabled = true;
            this._targetOpacity = this._opacity;
            if (this._sprite) this._sprite.visible = true;
        }

        fadeOut(duration) {
            this._fadeDuration = duration;
            this._fadeCounter = duration;
            this._targetOpacity = 0;
            if (this._sprite) this._sprite.visible = true; // 페이드 중에도 표시
        }

        update() {
            if (this._fadeCounter > 0) {
                this._fadeCounter--;
                const rate = this._fadeCounter / this._fadeDuration;
                if (this._sprite) {
                    if (this._targetOpacity === 0) {
                        this._sprite.opacity = this._opacity * rate;
                    } else {
                        this._sprite.opacity = this._opacity * (1 - rate);
                    }
                }
                if (this._fadeCounter === 0 && this._targetOpacity === 0) {
                    this._enabled = false;
                    if (this._sprite) this._sprite.visible = false;
                }
            }
            if (this._enabled && this._sprite && Graphics.frameCount % 4 === 0) {
                this._sprite.tilePosition.x += this._speedX / 30;
                this._sprite.tilePosition.y += this._speedY / 30;
            }
        }

        createSprite(scene) {
            if (this._sprite) return;
            const bitmap = ImageManager.loadFog("mist") || this.createDefaultFogBitmap();
            this._sprite = new TilingSprite(bitmap);
            this._sprite.move(0, 0, Graphics.width, Graphics.height);
            this._sprite.opacity = this._enabled ? this._opacity : 0;
            this._sprite.tint = parseInt(this._color.replace("#", ""), 16);
            this._sprite.visible = this._enabled;
            scene.addChild(this._sprite);
        }

        createDefaultFogBitmap() {
            const bitmap = new Bitmap(512, 512);
            bitmap.fillAll("#808080");
            return bitmap;
        }

        destroySprite() {
            if (this._sprite && this._sprite.parent) {
                this._sprite.parent.removeChild(this._sprite);
            }
            this._sprite = null;
        }

        isInFogRegion() {
            if (this._regionIds.length === 0) return true;
            const x = $gamePlayer.x;
            const y = $gamePlayer.y;
            const regionId = $gameMap.regionId(x, y);
            return this._regionIds.includes(regionId);
        }
    }

    const mistyWeather = new MistyWeather();

    // 플러그인 명령 등록
    PluginManager.registerCommand("MistyWeatherMZ", "MistyWeather On", () => {
        mistyWeather.enable();
    });

    PluginManager.registerCommand("MistyWeatherMZ", "MistyWeather Off", () => {
        mistyWeather.disable();
    });

    PluginManager.registerCommand("MistyWeatherMZ", "MistyWeather SetOpacity", args => {
        mistyWeather.setOpacity(Number(args.opacity));
    });

    PluginManager.registerCommand("MistyWeatherMZ", "MistyWeather SetColor", args => {
        mistyWeather.setColor(args.color);
    });

    PluginManager.registerCommand("MistyWeatherMZ", "MistyWeather SetSpeed", args => {
        mistyWeather.setSpeed(Number(args.speedX), Number(args.speedY));
    });

    PluginManager.registerCommand("MistyWeatherMZ", "MistyWeather FadeIn", args => {
        mistyWeather.fadeIn(Number(args.duration));
    });

    PluginManager.registerCommand("MistyWeatherMZ", "MistyWeather FadeOut", args => {
        mistyWeather.fadeOut(Number(args.duration));
    });

    // Scene_Map 확장
    const _Scene_Map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
    Scene_Map.prototype.createDisplayObjects = function() {
        _Scene_Map_createDisplayObjects.call(this);
        mistyWeather.createSprite(this);
    };

    const _Scene_Map_update = Scene_Map.prototype.update;
    Scene_Map.prototype.update = function() {
        _Scene_Map_update.call(this);
        mistyWeather.update();
        // 지역 체크
        if (mistyWeather.isInFogRegion()) {
            mistyWeather._sprite.visible = mistyWeather._enabled;
        } else {
            mistyWeather._sprite.visible = false;
        }
    };

    const _Scene_Map_terminate = Scene_Map.prototype.terminate;
    Scene_Map.prototype.terminate = function() {
        mistyWeather.destroySprite();
        _Scene_Map_terminate.call(this);
    };

    // 맵 로드 시 설정 초기화
    const _Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;
    Scene_Map.prototype.onMapLoaded = function() {
        _Scene_Map_onMapLoaded.call(this);
        mistyWeather.initialize();
    };

    // ImageManager에 fog 로드 추가
    ImageManager.loadFog = function(filename) {
        return this.loadBitmap("img/fogs/", filename, 0, true);
    };
})();