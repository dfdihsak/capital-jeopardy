import React, { Component } from 'react';

/**
 * Configures initial state of category.
 */
const INITIAL_STATE = {
    category: null,
    selectedClue: null,
    answer: ''
}

/**
 * The Category component shows up to 5 clue buttons organized on a card as
 * they would be in a game, with easier questions on top. When the user presses
 * a clue the card flips over and shows the question with an answer field.
 * 
 * @author Jessie Sui
 * @version 1.0
 */
class Category extends Component {
    /**
     * This constructor method constructs the category with the category
     * passed down from its parent component.
     *
     * @param props makes it a React component
     */
    constructor(props) {
        super(props);
        this.state = {
            ...INITIAL_STATE,
            category: this.props.category
        }
    }

    /**
     * This method updates the category if it experiences changes.
     *
     * @param prevProps used to detect a change in categories
     */
    componentDidUpdate(prevProps) {
        if (this.props.category !== prevProps.category) {
            this.setState({
                ...this.state,
                category: this.props.category
            })
        } console.log(this.state.category)
    }

    /**
     * This method updates the answer bar based on user input.
     * @param event user types into the answer bar
     */
    onChange = event => {
        this.setState({
            ...this.state,
            [event.target.name]: event.target.value
        });
    }

    /**
     * This method sets a selected clue when the user presses that clue's button.
     * @param clue clue corresponding to pressed button
     */
    setClue = (clue) => {
        console.log('set clue')
        this.setState({
            ...this.state,
            selectedClue: this.state.selectedClue ? null : clue,
            answer: ''
        })
    }

    /**
     * This method passes the user's answer back to the parent component and returns
     * to the clue buttons.
     */
    submitAnswer = () => {
        this.props.onAnswer(this.state.selectedClue, this.state.answer);
        this.setClue(null);
    }

    /**
     * This method marks a clue button red or green depending on whether the user
     * answered correctly.
     */
    markClue = (clue) => {
        if (!clue) {
            return 'primary';
        }

        const clueMatchedAnswers = this.props.answered.filter(answer => answer.clue.id === clue.id);
        if (clueMatchedAnswers.length == 0) {
            return "primary";
        } else {
            return clueMatchedAnswers.some(answer => answer.answer === clue.answer) ? "success" : "danger";
        }
    }

    /**
     * This method returns the user's answer to a clue.
     * @param clue the specified clue
     */
    getMyAnswer = (clue) => {
        return this.props.answered.filter(answer => answer.clue.id === clue.id).map(answer => answer.answer)[0];
    }

    /**
     * This method gives the user a hint to a clue.
     * @param clue the specified clue
     */
    getHint = (clue) => {
        const hint = (clue || {}).answer || '';
        if (hint.length < 3) {
            return hint.replace(/\S/g, "*");
        }
        const middle = hint.substring(1, hint.length - 1);
        // replace ALL non-whitespace to *
        return hint[0] + middle.replace(/\S/g, "*") + hint[hint.length - 1];
    }

    /**
     * This method returns whether a clue has been favorited.
     * @param clue the specified clue
     */
    isFavorite = (clue) => {
        return (this.props.favorites || []).some(fav => fav.question === (clue || {}).question);
    }

    /**
     * This method displays the category.
     */
    render() {
        // maps only the first 5 qualified clues for rendering in category
        const first5Clues = this.state.category.clues.slice(0, 5);
        // shows a heart next to favorited clues
        const listItems = first5Clues.map((clue) =>
            <button onClick={e => this.setClue(clue)} class={`btn btn-${this.markClue(clue)} btn-block ${this.state.selectedClue ? 'bg-warning' : ''}`}>${clue.value}
                <i class={`ml-1 text-danger ${this.isFavorite(clue) ? 'fas fa-heart' : ''}`}></i>
            </button>
        );

        return (
            <div class="card col-6 col-sm-4 col-md-4 col-lg-4 py-3">
                <div class="flip-card">
                    <div class={`flip-card-inner ${this.state.selectedClue ? 'flip' : ''}`}>
                        {/* the front of each category shows clue buttons organized as they would be in a game*/}
                        <div class="flip-card-front">
                            <h5 class="card-title">{this.state.category.title}</h5>
                            {listItems}
                        </div>

                        {/* the back shows the selected clue and options to favorite or go back */}
                        <div class="flip-card-back">
                            <button
                                type="button"
                                class="close"
                                aria-label="Close"
                                onClick={e => this.setClue(null)}
                            >
                                <span aria-hidden="true">&times;</span>
                            </button>

                            {/* heart button appears red if favorited, clear if not */}
                            <button
                                type="button"
                                class="btn heart-button"
                                onClick={e => this.props.toggleFavorite(this.state.selectedClue)}
                            >
                                <span aria-hidden="true">
                                    <i class={`text-danger ${this.isFavorite(this.state.selectedClue) ?
                                        'fas' : 'far'} fa-heart`}>
                                    </i>
                                </span>
                            </button>

                            <h5 >${this.state.selectedClue ? this.state.selectedClue.value : ''}</h5 >
                            {/* Displays the question with an answer field and hint if never answered before.
                            Displays user answer and the correct answer after user submits an answer. */}
                            <p class="text-small">{this.state.selectedClue ? this.state.selectedClue.question : ''}</p>
                            {
                                this.markClue(this.state.selectedClue) === "primary" ?
                                    <div>
                                        <div class="input-group mb-3">
                                            <input
                                                type="text"
                                                name="answer"
                                                value={this.state.answer}
                                                class="form-control"
                                                placeholder="Answer"
                                                aria-label="Answer"
                                                aria-describedby="button-addon2"
                                                onChange={this.onChange}
                                            />

                                            <div class="input-group-append">
                                                <button
                                                    onClick={event => this.submitAnswer()}
                                                    class="btn btn-outline-secondary"
                                                    type="button" id="button-addon2"
                                                >
                                                    <i class="fas fa-check"></i>
                                                </button>
                                            </div>
                                        </div>

                                        <p class="text-small text-muted">
                                            Hint: {this.getHint(this.state.selectedClue)}
                                        </p>
                                    </div>
                                    :
                                    <div class="text-small">
                                        <div>Your Answer: {this.getMyAnswer(this.state.selectedClue)}</div>
                                        <div>Correct Answer: {this.state.selectedClue.answer}</div>
                                    </div>
                            }

                        </div>
                    </div>
                </div>
            </div>

        )
    }
}

export default Category;