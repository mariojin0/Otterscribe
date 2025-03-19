/*:
 * @target MZ
 * @plugindesc RPG Maker MZ에서 한글 입력과 키보드 입력을 지원하는 플러그인
 * @author OtterScribe
 *
 * @help
 * 이 플러그인은 RPG Maker MZ에서 한글 입력과 키보드 입력을 지원하도록 합니다.
 *
 * 사용 방법:
 * - 이벤트 명령에서 '이름 입력 처리'를 사용할 때 한글을 입력할 수 있습니다.
 * - 키보드를 이용한 직접 입력이 가능합니다.
 *
 */

(() => {
    class HangulInputWindow extends Window_NameEdit {
        initialize(actor, maxLength) {
            super.initialize(actor, maxLength);
            this.createInputListener();
        }

        createInputListener() {
            this._inputElement = document.createElement("input");
            this._inputElement.type = "text";
            this._inputElement.style.position = "absolute";
            this._inputElement.style.opacity = 0;
            this._inputElement.style.pointerEvents = "none";
            document.body.appendChild(this._inputElement);
            
            this._inputElement.addEventListener("compositionstart", () => {
                this._composing = true;
            });
            
            this._inputElement.addEventListener("compositionupdate", (event) => {
                this._currentComposition = event.data;
            });
            
            this._inputElement.addEventListener("compositionend", (event) => {
                this._composing = false;
                this.processCharacter(event.data);
            });
            
            this._inputElement.addEventListener("input", (event) => {
                if (!this._composing) {
                    this.processCharacter(event.data);
                }
            });
            
            document.addEventListener("keydown", this.onKeyDown.bind(this));
        }

        onKeyDown(event) {
            if (event.ctrlKey || event.altKey) return;
            
            if (event.key === "Backspace") {
                this.backspace();
            } else if (event.key.length === 1) {
                this._inputElement.focus();
            }
        }

        processCharacter(char) {
            if (this._index < this._maxLength) {
                this._name += char;
                this._index++;
                this.refresh();
            }
        }

        backspace() {
            if (this._name.length > 0) {
                this._name = this._name.slice(0, -1);
                this._index--;
                this.refresh();
            }
        }
    }

    Window_NameEdit = HangulInputWindow;
})();