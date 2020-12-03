document.addEventListener('DOMContentLoaded', function () {
  // document.querySelector('#roadmap-dropdown').addEventListener('click', () => load_roadmaps())

  document.querySelector('#edit-view').style.display = 'none';
  document.querySelector("#roadmap-view").style.display = 'none';
  document.querySelector("#milestone-list").style.display = 'none';


  // if user is a roadmap owner, i.e. there's a roadmap dropdown menu in the navbar,
  // query all the roadmap names and add them to the dropdown and link them to the load_roadmap function
  var rmdropdown = document.getElementById('roadmap-dropdown');
  if (typeof (rmdropdown) != 'undefined' && rmdropdown != null) {
    fetch('/roadmaps')
      .then(response => response.json())
      .then(roadmaps => {
        roadmaps.forEach(roadmap => {
          var roadmaprow = document.createElement('a');
          roadmaprow.classList.add('dropdown-item');
          roadmaprow.setAttribute("id", `roadmap-${roadmap.id}`);
          roadmaprow.setAttribute("href", "#")
          roadmaprow.innerHTML = roadmap.name;
          rmdropdown.appendChild(roadmaprow);
          document.getElementById(`roadmap-${roadmap.id}`).addEventListener('click', () => load_roadmap(roadmap.id));
        });
      })
  }
})


// first loads the roadmaps information, then loads the milestones and impacts
function load_roadmap(roadmap_id) {
  document.querySelector('#edit-view').style.display = 'none';
  document.querySelector("#roadmap-view").style.display = 'block';
  document.querySelector("#milestone-list").style.display = 'block';
  document.querySelector("#roadmap-view").innerHTML = '';
  document.querySelector("#milestone-list").innerHTML = '<h6>Milestones<h6>';

  // add 'Add Milestone' button
  var ms_button = document.createElement('div');
  ms_button.innerHTML = '<input type="button" id="add-milestone" class="btn btn-secondary btn-sm" style="float:left" value="Add Milestone"><br>';
  document.querySelector("#milestone-list").appendChild(ms_button);
  document.getElementById('add-milestone').addEventListener('click', () => add_milestone(roadmap_id));


  fetch(`/roadmap/${roadmap_id}`)
    .then(response => response.json())
    .then(result => {

      var roadmap_name = result[0].fields.name;
      var created_on = result[0].fields.created_on;
      var description = result[0].fields.description;
      var country = result[0].fields.country;
      var region = result[0].fields.region;
      var owner = result[0].fields.owner;

      if (result[0].fields.last_updated == null) {
        var last_updated = '';
      } else {
        var last_updated = result[0].fields.last_updated;
      }
      if (result[0].fields.last_updater == null) {
        var last_updater = '';
      } else {
        var last_updater = result[0].fields.last_updater;
      }
      // add roadmap info to the top of the view
      var info = document.createElement('div');
      info.classList.add("container");
      info.innerHTML = `<div class="row">
                          <div class="col"><h6>${roadmap_name}</h6></div>
                          <div class="col" style="color:darkgray;text-align:right;"><i><small>Created on: ${created_on}</small></i></div>
                        </div>
                        <div class="row">
                          <div id="owner-name" class="col"></div>
                          <div class="col" style="color:darkgray;text-align:right;"><i><small>Last updated on: ${last_updated}</small></i></div>
                        </div>
                        <div class="row">
                          <div class="col-10">${description}</div>
                          <div id="updater-div" class="col" style="color:darkgray;text-align:right;"></div>
                        </div>
                        <div class="row">
                          <div id="location" class="col">${country}, ${region}</div>
                          <div id="edit-${roadmap_id}" class="col-2"><div class="edit" style="color:blue;text-align:right;">Edit</div></div>
                        </div>`;
      document.querySelector("#roadmap-view").appendChild(info);
      // add ability to edit the roadmap's basic info
      document.getElementById(`edit-${roadmap_id}`).addEventListener('click', () => edit_roadmap(roadmap_id, roadmap_name, owner, created_on, last_updated, description, last_updater, country, region));

      // get user information for the owner and the latest updater fields in the roadmap-info view
      var owner_div = document.getElementById('owner-name');
      fetch(`/user/${owner}`)
        .then(response => response.json())
        .then(user => {
          owner_div.innerHTML = 'Owner: ' + user[0].fields.first_name + " " + user[0].fields.last_name;
        })

      var updater_div = document.getElementById('updater-div');
      fetch(`/user/${last_updater}`)
        .then(response => response.json())
        .then(user => {
          var updater = user[0].fields.first_name + " " + user[0].fields.last_name;
          updater_div.innerHTML = `<i><small>By: ${updater}</small></i>`
        })

      // get the country information
      var location_div = document.getElementById('location');
      fetch('/countries')
        .then(response => response.json())
        .then(countries => {
          var length = Object.keys(countries).length;
          for (i = 1; i < length + 1; i++) {
            if (countries[i].code == country) {
              location_div.innerHTML = `${countries[i].name}, ${region}`;
            }
          }
        })

      // get milestones
      fetch(`/milestones/${roadmap_id}`)
        .then(response => response.json())
        .then(milestones => {
          milestones.forEach(milestone => {
            // if some of the date values are null, make them empty:
            if (milestone.plan_date == null) {
              var plan_date = '';
            } else {
              var plan_date = milestone.plan_date;
            }

            if (milestone.forecast_date == null) {
              var forecast_date = '';
            } else {
              var forecast_date = milestone.forecast_date;
            }
            // add milestone to the page
            var ms_row = document.createElement('div');
            ms_row.classList.add("container");
            ms_row.setAttribute("id", `ms-${milestone.id}`)
            ms_row.innerHTML = `<div class="row">
                                  <div class="col-1"><small>#</small></div>
                                  <div class="col-4"><small>Description</small></div>
                                  <div class="col-2 d-flex justify-content-center"><small>Plan</small></div>
                                  <div class="col-2 d-flex justify-content-center"><small>Forecast</small></div>
                                  <div class="col-2 d-flex justify-content-center"><small>Realized</small></div>
                                  <div class="col-1"><small></small></div>
                                </div>
                                <div class="row">
                                  <div id="ms-${milestone.number}" class="col-1"><div class="ms-number" id="num-${milestone.number}">${milestone.number}</div></div>
                                  <div class="col-4">${milestone.description}</div>
                                  <div class="col-2 d-flex justify-content-center">${plan_date}</div>
                                  <div class="col-2 d-flex justify-content-center"><input type="date" class="input-field" id="fcst-date-${milestone.id}" value="${forecast_date}"></div>
                                  <div class="col-2 d-flex justify-content-center" style="padding:8px;"><input type="checkbox" id="act-${milestone.id}"></div>
                                  <div class="col-1 d-flex justify-content-end"><div class="trash"><i class="fa fa-trash-o" id="del-${milestone.id}"></i></div></div>
                                </div>`;
            document.querySelector("#milestone-list").appendChild(ms_row);
            document.getElementById(`act-${milestone.id}`).checked = milestone.realized;
            document.getElementById(`del-${milestone.id}`).addEventListener('click', () => del_milestone(milestone.id));
            // get and add impacts to the milestone div
            fetch(`/impacts/${milestone.id}`)
              .then(response => response.json())
              .then(impact => {
                if ("message" in impact) {
                  console.log(impact);
                } else {
                  var length = Object.keys(impact).length;
                  console.log(impact);
                  for (i = 0; i < length; i++) {
                    if (impact[i].plan_amount == null) {
                      var plan_amount = '';
                    } else {
                      var plan_amount = impact[i].plan_amount;
                    }
                    if (impact[i].forecast_amount == null) {
                      var forecast_amount = '';
                    } else {
                      var forecast_amount = impact[i].forecast_amount;
                    }
                    const impact_id = impact[i].id;
                    var impact_row = document.createElement('div');
                    impact_row.setAttribute("id", `imp-${impact_id}`);
                    impact_row.setAttribute("style", 'background-color:white;margin:2px;padding-top:5px')
                    impact_row.innerHTML = `<div class="row">
                                              <div class="col-1"></div>
                                              <div class="col-4 d-flex justify-content-end">${impact[i].impact_type}</div>
                                              <div class="col-2 d-flex justify-content-center">${plan_amount}</div>
                                              <div class="col-2 d-flex justify-content-center"><input class="input-field" type="number" id="fcst-value-${impact_id}" value="${forecast_amount}"></div>
                                              <div class="col-2 d-flex justify-content-center"></div>
                                              <div class="col-1 d-flex justify-content-end"><div class="trash" style="padding-right:15px"><i class="fa fa-trash-o" id="del-${impact_id}"></i></div></div>
                                            </div>`;
                    document.querySelector(`#ms-${milestone.id}`).appendChild(impact_row);
                    document.getElementById(`del-${impact_id}`).addEventListener('click', () => del_impact(`${impact_id}`));
                  }
                }
              })
          });
        })
    })
}

function edit_roadmap(roadmap_id, roadmap_name, owner, created_on, last_updated, description, last_updater, current_country, current_region) {
  // hide the roadmap info and show the edit view
  document.querySelector('#roadmap-view').style.display = 'none';
  document.querySelector('#edit-view').style.display = 'block';
  document.querySelector("#edit-view").innerHTML = '';

  // create the text fields and put in the data for editing
  var edit = document.createElement('div');
  edit.classList.add("container");
  edit.innerHTML = `<div class="row">
                      <div class="col-10"><input type="text" id="edit-name" value="${roadmap_name}"></div>
                      <div class="col-2" style="color:darkgray;text-align:right;"><i><small>Created on: ${created_on}</small></i></div>
                    </div>
                    <div class="row">
                      <div class="col-10"><select id="edit-owner" name="owners"></select></div>
                      <div class="col-2" style="color:darkgray;text-align:right;"><i><small>Last updated on: ${last_updated}</small></i></div>
                    </div>
                    <div class="row">
                      <div class="col-10"><textarea id="edit-desc">${description}</textarea></div>
                      <div id="edit-updater-div" class="col-2" style="color:darkgray;text-align:right;"></div>
                    </div>
                    <div class="row">
                      <div class="col-5"><select id="edit-country" name="countries"></select></div>
                      <div class="col-5"><select id="edit-region" name="regions"></select></div>
                      <div class="col-2"><input type="button" id="save-${roadmap_id}" class="btn btn-primary" style="float:right" value="Save Edits"></div>
                    </div>`;

  document.querySelector("#edit-view").appendChild(edit);
  // add save function to save button
  document.getElementById(`save-${roadmap_id}`).addEventListener('click', () => post_edits(roadmap_id));

  // add last updater's name
  var updater_div = document.getElementById('edit-updater-div');
  fetch(`/user/${last_updater}`)
    .then(response => response.json())
    .then(user => {
      var updater = user[0].fields.first_name + " " + user[0].fields.last_name;
      updater_div.innerHTML = `<i><small>By: ${updater}</small></i>`
    })

  // get list of users and add them to the edit-owner dropdown
  var owner_dropdown = document.getElementById('edit-owner');
  fetch('/profiles')
    .then(response => response.json())
    .then(profiles => {
      profiles.forEach(profile => {
        if (profile.userid == owner) {
          var current_owner = profile.full_name;
          owner_dropdown.innerHTML = `<option value="${owner}">${current_owner}</option>`;
        }
      })
      profiles.forEach(profile => {
        owner_dropdown.innerHTML += `<option value="${profile.userid}">${profile.full_name}</option>`;
      })
    })

  // get list of regions and add them to the edit-region dropdown
  var region_dropdown = document.getElementById('edit-region');
  region_dropdown.innerHTML = `<option value="${current_region}">${current_region}</option>`;
  fetch('/regions')
    .then(response => response.json())
    .then(result => {
      const regions = result.regions;
      var length = Object.keys(regions).length;
      for (i = 1; i < length + 1; i++) {
        if (regions[i] != current_region) {
          var region = regions[i];
          region_dropdown.innerHTML += `<option value="${region}">${region}</option>`;
        }
      }
    })

  // get list of countries and add them to the edit-country dropdown
  var country_dropdown = document.getElementById('edit-country');
  fetch('/countries')
    .then(response => response.json())
    .then(countries => {
      var length = Object.keys(countries).length;
      for (j = 1; j < length + 1; j++)
        if (countries[j].code == current_country) {
          country_dropdown.innerHTML += `<option value="${countries[j].code}">${countries[j].name}</option>`;
        }
      for (k = 1; k < length + 1; k++) {
        if (countries[k].code != current_country) {
          country_dropdown.innerHTML += `<option value="${countries[k].code}">${countries[k].name}</option>`;
        }
      }
    })
}


function post_edits(roadmap_id) {
  // get all the data from the fields
  var name = document.getElementById('edit-name').value;
  var owner = parseInt(document.getElementById('edit-owner').value);
  var description = document.getElementById('edit-desc').value;
  var country = document.getElementById('edit-country').value;
  var region = document.getElementById('edit-region').value;

  // update the roadmap's info using POST
  fetch('/editroadmap', {
    method: 'PUT',
    body: JSON.stringify({
      roadmap_id: roadmap_id,
      name: name,
      owner: owner,
      description: description,
      country: country,
      region: region,
    })
  })
    .then(response => response.json())
    .then(result => {
      load_roadmap(roadmap_id);
    })
}

function add_milestone(roadmap_id) {
  console.log(`Adding milestone to roadmap ${roadmap_id}`)
  // get the count of existing milestones and add one
  const ms_numbers = document.querySelectorAll('.ms-number');
  console.log(ms_numbers);
  const new_ms_number = ms_numbers.length + 1;
  console.log(new_ms_number);
  // add a new milestone to the page
  var ms_row = document.createElement('div');
  ms_row.classList.add("container");
  ms_row.setAttribute("id", 'new-milestone')
  ms_row.innerHTML = `<div class="row">
                        <div class="col-1"><small>#</small></div>
                        <div class="col-4"><small>Description</small></div>
                        <div class="col-2 d-flex justify-content-center"><small>Plan</small></div>
                        <div class="col-2 d-flex justify-content-center"><small>Forecast</small></div>
                        <div class="col-2 d-flex justify-content-center"><small>Realized</small></div>
                        <div class="col-1"><small></small></div>
                      </div>
                      <div class="row">
                        <div id="ms-${new_ms_number}" class="col-1"><div class="ms-number" id="num-${new_ms_number}">${new_ms_number}</div></div>
                        <div class="col-4 d-flex justify-content-center"><input class="input-desc" type="text" id="new-desc"></div>
                        <div class="col-2 d-flex justify-content-center"><input class="input-field" type="date" id="plan-date"></div>
                        <div class="col-2 d-flex justify-content-center"></div>
                        <div class="col-2 d-flex justify-content-center"></div>
                        <div class="col-1 d-flex justify-content-center"></div>
                      </div>
                      <div class="row">
                        <div class="col-1 d-flex justify-content-start"><input type="button" id="save-ms-${new_ms_number}" class="btn btn-primary btn-sm" value="Save"></div>
                        <div class="col-1 d-flex justify-content-start"><input type="button" id="add-impact-${new_ms_number}" class="btn btn-outline-primary btn-sm" value="Add impact" style="padding-top:5px;"></div>
                        <div class="col-10 d-flex justify-content-center"></div>
                      </div>`;
  document.querySelector("#milestone-list").appendChild(ms_row);
  document.getElementById(`save-ms-${new_ms_number}`).addEventListener('click', () => save_milestone(roadmap_id, new_ms_number));
  document.getElementById(`add-impact-${new_ms_number}`).addEventListener('click', () => add_impact(new_ms_number));
}

function save_milestone(roadmap_id, milestone_num) {
  console.log(`Saving milestone #${milestone_num} on roadmap id ${roadmap_id}`)
}

function del_milestone(milestone_id) {
  console.log(`Deleting milestone id ${milestone_id}`)
}

function add_impact(ms_number) {
  console.log(`Adding impact on milestone #${ms_number}`)
}

function del_impact(impact_id) {
  console.log(`Deleting impact id ${impact_id}`)
}