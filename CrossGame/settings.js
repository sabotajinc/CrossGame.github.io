class GameSettins {
    constructor(props = {}) {
        // this = {}
        // this.__proto__ = GameSettings.prototype

        const { selector, changeHandler, submitHandler } = props;

        this.changeHandler = changeHandler;
        this.submitHandler = submitHandler;

        this.$form = document.querySelector(selector);
        // this.$robotName = this.$form.querySelector('[name='robotName']');
        this.$robotName = this.$form.elements['robotName'];

        this.$robotName.addEventListener('change', this.robotNameChangeHandler.bind(this));
        this.$form.addEventListener('submit', this.onSubmit.bind(this));

        // return this;
    }

    // set robotName(newValue) {
    //     this.$robotName.value = newValue;
    // }

    get robotName() {
        return this.$robotName.value;
    }

    robotNameChangeHandler(e) {
        if (this.changeHandler) {
            this.changeHandler();
        }
    }

    onSubmit(e) {
        e.preventDefault();

        if (this.submitHandler) {
            this.submitHandler();
        }
    }
}