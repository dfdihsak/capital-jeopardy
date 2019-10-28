import React, { Component } from 'react';
import Category from './category';

/**
 * The Board component displays categories that match the search.
 * 
 * @author Jessie Sui
 * @version 1.0
 */
class Board extends Component {
    /**
     * This constructor method constructs the board using categories passed down
     * from its parent component.
     *
     * @param props makes it a React component
     */
    constructor(props) {
        super(props);
        this.state = {
            categories: this.props.categories
        }
    }

    /**
     * This method updates the board when the categories change.
     *
     * @param prevProps used to detect a change in categories
     */
    componentDidUpdate(prevProps) {
        if (this.props.categories !== prevProps.categories) {
            this.setState({
                categories: this.props.categories
            })
        }
    }
    /**
     * This method displays the board.
     */
    render() {
        // maps categories to Category component for rendering
        const listItems = this.state.categories.map((category) =>
            <Category category={category} onAnswer={this.props.onAnswer} answered={this.props.answered} toggleFavorite={this.props.toggleFavorite} favorites={this.props.favorites} />
        );

        return (
            <div class="row">
                {listItems}
            </div>
        )
    }
}

export default Board;