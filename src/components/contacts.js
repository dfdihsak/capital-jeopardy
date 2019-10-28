/**
 * @author 
 */

import React from 'react';

const Contacts = ({ contacts }) => {    // param takes contacts state
    return(
        <div>
          <center><h1>Contact List</h1></center>
          {contacts.map((contact) => (
            <div class="card">
              <div class="card-body">
                <h5 class="card-title">{contact.answer}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{contact.airdate}</h6>
                <p class="card-text">{contact.question}</p>
              </div>
            </div>
          ))}
        </div>
    )
}

export default Contacts