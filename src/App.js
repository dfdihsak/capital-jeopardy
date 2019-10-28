import React, { Component } from 'react';
import Board from './components/board';

/**
 * Configures initial state of app.
 */
const INITIAL_STATE = {
  /**
   * Configures filtering options to make searching easier for user.
   * User can filter by date span and difficulty.
   */
  filters: {
    min_date: undefined,
    max_date: undefined,
    value: 'any'
  },
  /**
   * Initial states of search text, resulting categories, answered and
   * favorited clues, and searching status.
   */
  searchText: '',
  categories: [],
  answered: [],
  favorites: [],
  searching: false
}

/**
 * Configures the maximum number of search results allowed to show on screen.
 */
const MAX_CATEGORIES = 12;

/**
 * Configures options to make filtering by difficulty easier for user.
 * More difficult questions correspond to higher price values.
 */
const DIFFICULTIES = ['any', 100, 200, 300, 400, 500, 600, 800, 1000];

/**
 * The Capital Jeopardy app lets you search for categories, favorite and filter
 * clues, and practice answering them while keeping score.
 * 
 * @author Jessie Sui
 * @version 1.0
 */
class App extends Component {
  /**
   * This constructor method constructs the app with initial state or loads the
   * saved state from the previous browser session.
   *
   * @param props makes it a React component
   */
  constructor(props) {
    super(props);

    const savedState = JSON.parse(localStorage.getItem('app-state'));
    if (savedState) {
      this.state = {
        ...savedState
      }
    } else {
      this.state = {
        ...INITIAL_STATE
      }
    }
  }

  /**
   * This method fetches clue data from the jService API using a URL constructed
   * from user input or default values if the user did not input anything
   *
   * @param categoryId category that clues are grouped by when fetching
   * results
   */
  searchClues = async (categoryId) => {
    const categoryQs = `category=${categoryId}`;
    const maxDateQs = `max_date=${this.state.filters.max_date || new Date().toISOString()}`;
    const minDateQs = `min_date=${this.state.filters.min_date || new Date(0).toISOString()}`;
    const valueQs = this.state.filters.value === 'any' ? '' : `value=${this.state.filters.value}`;

    const constructedUrl = `http://jservice.io/api/clues?${[maxDateQs, minDateQs, categoryQs, valueQs].join('&')}`;

    return fetch(constructedUrl).then(res => res.json());
  }

  /**
   * This method uses search text from the user to find Jeopardy categories.
   * This is actually not part of the jService API but scrapes the pages of
   * jService's category search for category IDs using a regular expression.
   *
   * @param event user presses the Search button
   */
  onSearch = async event => {
    // show loading animation
    await this.setState({
      ...this.state,
      searching: true
    });

    // scrape jService category search
    const res = await fetch(`http://jservice.io/search?query=${encodeURIComponent(this.state.searchText)}`);
    const html = await res.text();
    let regexp = /popular\/\d+/g;
    const matchedIds = (html.match(regexp) || []).map(match => match.substr(8));

    // get clues of each category!
    const categories = [];
    for (let categoryId of matchedIds) {
      const clues = await this.searchClues(categoryId);
      // we should keep ONLY unique clues
      const questionSet = new Set();
      const uniqueClues = [];
      clues.map(clue => {
        if (!questionSet.has(clue.question)) {
          questionSet.add(clue.question);
          uniqueClues.push(clue);
        }
      });

      // some clues have null value, set that to 0
      uniqueClues.map(clue => clue.value = clue.value ? clue.value : 0);

      // sort clues by value so easiest ones appear on top
      uniqueClues.sort((clue1, clue2) => clue1.value - clue2.value);

      if (uniqueClues.length > 0) {
        const category = {
          // get category title and clues for each category
          title: uniqueClues[0].category.title,
          clues: uniqueClues
        };
        categories.push(category);
        // respect the maximum search result limit
        if (categories.length >= MAX_CATEGORIES) {
          break;
        }
      }
    }

    this.setState({
      searching: false,
      categories: categories
    });

    // save state to localStorage so that next time we can reload it!
    localStorage.setItem('app-state', JSON.stringify(this.state));

  }

  /**
   * This method marks a clue as answered.
   * @param clue clue that was answered
   * @param answer stores answer for scoring purposes
   */
  onAnswer = async (clue, answer) => {
    await this.setState({
      ...this.state,
      answered: [...this.state.answered, {
        clue: clue,
        answer: answer
      }]
    })

    // updates saved state in localStorage
    localStorage.setItem('app-state', JSON.stringify(this.state));

  }

  /**
   * This method updates search filters based on user input.
   * @param event user changes a filter
   */
  onFilterChange = event => {
    this.setState({
      ...this.state,
      filters: { ...this.state.filters, [event.target.name]: event.target.value }
    });
  }

  /**
   * This method updates the search bar based on user input.
   * @param event user types into the search bar
   */
  onSearchTextChange = event => {
    this.setState({
      ...this.state,
      [event.target.name]: event.target.value
    });
  }

  /**
   * This method updates the selected value based on user selection.
   * @param event user selects option from dropdown
   */
  selectValue = async event => {
    const newFilters = { ...this.state.filters, [event.target.name]: event.target.value };
    await this.setState({
      ...this.state,
      filters: newFilters
    });
    this.onSearch();
  }

  /**
   * This method returns user answers that match the right answer. 
   */
  getCorrectAnswers() {
    return this.state.answered.filter(answer => answer.answer === answer.clue.answer);
  }

  /**
   * This method sums the values of the user's correct answers. 
   */
  calculateEarnings() {
    const correctValues = this.getCorrectAnswers().filter(answer => answer.clue.value).map(answer => answer.clue.value);
    return correctValues.reduce((sum, num) => sum + num, 0);
  }

  /**
   * This method lets the user favorite and un-favorite a clue.
   * @param clue clue that is favorited or un-favorited
   */
  toggleFavorite = async (clue) => {
    let newFavList = this.state.favorites || [];
    if (newFavList.some(fav => fav.question === clue.question)) {
      newFavList = newFavList.filter(fav => fav.question !== clue.question);
    } else {
      newFavList.push(clue);
    }

    await this.setState({
      ...this.state,
      favorites: newFavList
    });

    // updates saved state in localStorage
    localStorage.setItem('app-state', JSON.stringify(this.state));
  }

  /**
   * This method displays the app.
   */
  render() {

    // maps difficulty options to HTML component for rendering
    const difficultyfilters = DIFFICULTIES.map((difficulty) =>
      <option>{difficulty}</option>
    );

    return (
      <div>
        {/* logo header */}
        <div class="pb-3">
          <img class="title-img" src="/logo.png" />
        </div>

        {/* scoreboard */}
        <h5>Score
          <span class="ml-1 badge badge-success">
            ${this.calculateEarnings()}
          </span>
          <span class="ml-1 badge badge-secondary">
            {this.getCorrectAnswers().length} out of {this.state.answered.length}
          </span>
          <span>
            <i class="ml-3 text-danger fas fa-heart"></i> {(this.state.favorites || []).length}
          </span>
        </h5>

        {/* searchbar */}
        <div class="input-group mb-3">
          <input
            type="text"
            class="form-control"
            placeholder="Category"
            aria-label="Category"
            aria-describedby="button-addon2"
            onChange={this.onSearchTextChange}
            name="searchText"
            value={this.state.searchText}
          />

          <div class="input-group-append">
            <button
              onClick={this.onSearch}
              class="btn btn-outline-secondary w-5"
              type="button"
              id="button-addon2"
            >
              {!this.state.searching ?
                <i class="fas fa-search"></i> :
                <i class="fas fa-spinner fa-spin"></i>}
            </button>
          </div>
        </div>

        <hr></hr>

        {/* filters */}
        <form class="form-inline">
          <label class="mb-2 mr-2" for="fromDate">From</label>
          <input
            id="fromDate"
            class="form-control mb-2 mr-sm-2"
            name="min_date"
            value={this.state.filters.min_date}
            onChange={this.onFilterChange}
            onBlur={this.onSearch}
            type="date"
          />

          <label class="mb-2 mr-2" for="toDate">To</label>
          <input
            id="toDate"
            class="form-control mb-2 mr-sm-2"
            name="max_date"
            value={this.state.filters.max_date}
            onChange={this.onFilterChange}
            onBlur={this.onSearch}
            type="date"
          />

          <label class="mb-2 mr-2" for="valueSelect"><i class="fas fa-dollar-sign"></i></label>
          <select
            id="valueSelect"
            class="form-control mb-2 mr-sm-2"
            name="value"
            value={this.state.filters.value}
            onChange={this.selectValue}
          >
            {difficultyfilters}
          </select>
        </form>

        {/* Board component to display search results*/}
        <Board
          categories={this.state.categories}
          onAnswer={this.onAnswer}
          answered={this.state.answered}
          toggleFavorite={this.toggleFavorite}
          favorites={this.state.favorites}
        />
      </div >
    )
  }
}

export default App;