document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('#edit-view').style.display = 'none';
  document.querySelector("#roadmap-view").style.display = 'none';
  document.querySelector("#milestone-list").style.display = 'none';
  document.querySelector("#profile-view").style.display = 'none';
  document.querySelector("#new-roadmap-view").style.display = 'none';
  document.querySelector("#new-stream-view").style.display = 'none';

  var btn_row = document.getElementById('btn-row');
  if (typeof (btn_row) != 'undefined' && btn_row != null) {
    document.querySelector("#btn-row").style.display = 'none';
  }

  var username = document.getElementById('username').innerHTML;
  document.getElementById('username').addEventListener('click', () => view_profile(username));

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
          roadmaprow.setAttribute("href", "#");
          roadmaprow.innerHTML = roadmap.name;
          rmdropdown.appendChild(roadmaprow);
          document.getElementById(`roadmap-${roadmap.id}`).addEventListener('click', () => load_roadmap(roadmap.id));
        });
      })
  }

  // if user is a stream / program admin, display the management view and load the needed information
  var mgmt_view = document.getElementById('mgmt-view');
  if (typeof (mgmt_view) != 'undefined' && mgmt_view != null) {
    var program_dd = document.getElementById('program-dd');
    // set a header / a dropdown for the program(s) that the user has access to and call treeview for the first/only one
    fetch('/programs')
      .then(response => response.json())
      .then(programs => {
        if (programs.length > 0) {
          var program_dropdown = document.createElement('div');
          program_dropdown.classList.add('dropdown')
          program_dropdown.setAttribute('id', 'program-dropdown');
          program_dropdown.innerHTML = `<button class="btn btn-outline-primary dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                          Select Program
                                        </button>
                                        <div id="dropdown-list" class="dropdown-menu" aria-labelledby="dropdownMenuButton">
                                        </div>`;
          program_dd.appendChild(program_dropdown);
          var dropdownlist = document.getElementById('dropdown-list');
          programs.forEach(program => {
            var programrow = document.createElement('option');
            programrow.setAttribute('id', `program-${program.pk}`);
            programrow.classList.add('dropdown-item');
            programrow.setAttribute("href", "#");
            programrow.innerHTML = program.fields.name;
            dropdownlist.appendChild(programrow);
            document.getElementById(`program-${program.pk}`).addEventListener('click', () => load_treeview(program.pk, program.fields.name));
          })
        } else {
          var program_id = Object.keys(programs);
          var program_name = programs[program_id[0]];
          program_dd.innerHTML = `<h5 style="margin-bottom:12px;">${program_name}</h5>`;
          load_treeview(program_id[0], program_name);
        }
      })
  }
})


// first loads the roadmaps information, then loads the milestones and impacts
function load_roadmap(roadmap_id) {
  document.querySelector('#edit-view').style.display = 'none';
  document.querySelector('#profile-view').style.display = 'none';
  document.querySelector("#roadmap-view").style.display = 'block';
  document.querySelector("#milestone-list").style.display = 'block';
  document.querySelector("#roadmap-view").innerHTML = '';

  // if user comes from the mgmt-view, enable the deletion button and add eventlistener
  var btn_row = document.getElementById('btn-row');
  if (typeof (btn_row) != 'undefined' && btn_row != null) {
    document.getElementById('delete-roadmap').disabled = false;
    document.getElementById('delete-roadmap').addEventListener('click', () => delete_roadmap(roadmap_id));
    // disable the other buttons
    document.getElementById('crete-stream').disabled = true;
    document.getElementById('delete-stream').disabled = true;
    document.getElementById('create-roadmap').disabled = true;
    document.getElementById('export-data').disabled = true;
  }

  var impact_table = document.getElementById('impact-table');
  if (typeof (impact_table) != 'undefined' && impact_table != null) {
    impact_table.style.display = 'none';
  }

  document.querySelector("#milestone-list").innerHTML = '<h5>Milestones<h5>';

  // add 'Add Milestone' button
  var ms_button = document.createElement('div');
  ms_button.innerHTML = `<input type="button" id="add-milestone" class="btn btn-secondary btn-sm" style="float:left" value="Add Milestone"><br>`;
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
                          <div class="col"><h5>${roadmap_name}</h5></div>
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
      // add ability to edit the roadmap's basic info, if user is not a roadmap owner
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
            // if milestone has realized, can't make changes anymore
            if (milestone.realized == false) {
              var forecast_col = `<input type="date" class="input-field" id="fcst-date-${milestone.id}" value="${forecast_date}">`
            } else {
              if (forecast_date == '') {
                forecast_date = milestone.plan_date;
              }
              var forecast_col = forecast_date;
            }
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
                                  <div class="col-2 d-flex justify-content-center" id="plan-date-${milestone.id}">${plan_date}</div>
                                  <div class="col-2 d-flex justify-content-center" id="fcst-date-div-${milestone.id}">${forecast_col}</div>
                                  <div class="col-2 d-flex justify-content-center" style="padding:8px;"><input type="checkbox" id="act-${milestone.id}"></div>
                                  <div class="col-1 d-flex justify-content-end"><div class="trash"><i class="fa fa-trash-o" id="del-${milestone.id}"></i></div></div>
                                </div>
                                <div class="row>
                                  <div class="col-1 d-flex justify-content-start"><input type="button" id="update-${milestone.id}" class="btn btn-primary btn-sm" value="Save"></div>
                                </div>`;
            document.querySelector("#milestone-list").appendChild(ms_row);
            document.getElementById(`act-${milestone.id}`).checked = milestone.realized;
            document.getElementById(`del-${milestone.id}`).addEventListener('click', () => del_milestone(milestone.id));
            document.getElementById(`update-${milestone.id}`).addEventListener('click', () => save_changes(milestone.id));
            document.getElementById(`update-${milestone.id}`).style.display = 'none';

            // if the input in the fcst date field is changed or the act box is ticked/unticked, the Save button becomes visible 
            var fcst_div = document.querySelector(`#fcst-date-${milestone.id}`);
            // var fcst_value = document.querySelector(`#fcst-date-${milestone.id}`).value;

            if (fcst_div != null) {
              fcst_div.oninput = () => {
                if (fcst_div.value == forecast_date) {
                  document.getElementById(`update-${milestone.id}`).style.display = 'none';
                } else {
                  document.getElementById(`update-${milestone.id}`).style.display = 'block';
                }
              }
            }

            // if milestone has not realized, add the update functionality, else disable the checkbox 
            if (milestone.realized == false) {
              document.querySelector(`#act-${milestone.id}`).oninput = () => {
                if (document.querySelector(`#act-${milestone.id}`).checked == milestone.realized) {
                  document.getElementById(`update-${milestone.id}`).style.display = 'none';
                } else {
                  document.getElementById(`update-${milestone.id}`).style.display = 'block';
                }
              }
            } else {
              document.querySelector(`#act-${milestone.id}`).disabled = true;
            }

            // get and add impacts to the milestone div
            fetch(`/impacts/${milestone.id}`)
              .then(response => response.json())
              .then(impact => {
                if ("message" in impact) {
                  console.log(impact);
                } else {
                  var length = Object.keys(impact).length;
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
                    impact_row.setAttribute("id", `${impact_id}`);
                    impact_row.classList.add("impact-row");

                    if (milestone.realized == false) {
                      var forecast_value_col = `<input class="input-field" type="number" id="fcst-value-${impact_id}" value="${forecast_amount}"></input>`
                    } else {
                      if (forecast_amount == '') {
                        var forecast_value_col = plan_amount;
                      } else {
                        var forecast_value_col = forecast_amount;
                      }
                    }

                    impact_row.innerHTML = `<div class="row">
                                              <div class="col-1"><div id="imp-${impact_id}" hidden>${impact_id}</div></div>
                                              <div class="col-4 d-flex justify-content-end" id="imp-type-${impact_id}">${impact[i].impact_type}</div>
                                              <div class="col-2 d-flex justify-content-center" id="plan-value-${impact_id}">${plan_amount}</div>
                                              <div class="col-2 d-flex justify-content-center" id="fcst-value-div-${impact_id}">${forecast_value_col}</div>
                                              <div class="col-2 d-flex justify-content-center"></div>
                                              <div class="col-1 d-flex justify-content-end"></div>
                                            </div>`;
                    document.querySelector(`#ms-${milestone.id}`).appendChild(impact_row);

                    // checks whether changes have been made to the forecast value and if so, shows the Save button
                    if (milestone.realized == false) {
                      const fcst_input = document.getElementById(`fcst-value-${impact_id}`);
                      fcst_input.oninput = () => {
                        if (fcst_input.value != forecast_amount) {
                          document.getElementById(`update-${milestone.id}`).style.display = 'block';
                        } else {
                          document.getElementById(`update-${milestone.id}`).style.display = 'none';
                        }
                      }
                    }
                  }
                }
              })
          });
        })
    })
  event.stopPropagation();
  event.preventDefault();
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
  const new_ms_number = ms_numbers.length + 1;
  // add a new milestone to the page
  var ms_row = document.createElement('div');
  ms_row.classList.add("container");
  ms_row.setAttribute("id", `new-milestone-${new_ms_number}`)
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
                        <div class="col-4"><input class="input-desc" type="text" id="new-desc-${new_ms_number}"></div>
                        <div class="col-2 d-flex justify-content-center"><input class="input-field" type="date" id="new-date-${new_ms_number}"></div>
                        <div class="col-2 d-flex justify-content-center" id="new-fcst-${new_ms_number}"></div>
                        <div class="col-2 d-flex justify-content-center" id="new-act-${new_ms_number}"></div>
                        <div class="col-1 d-flex justify-content-center" id="new-trash-${new_ms_number}"><div class="trash" style="padding-right:15px"><i class="fa fa-trash-o" id="del-newms-${new_ms_number}"></i></div></div>
                      </div>
                      <div class="row" id="button-row">
                        <div class="col-1 d-flex justify-content-start"><input type="button" id="save-ms-${new_ms_number}" class="btn btn-primary btn-sm" value="Save"></div>
                        <div class="col-1 d-flex justify-content-start"><input type="button" id="add-impact-${new_ms_number}" class="btn btn-outline-primary btn-sm" value="Add impact" style="padding-top:5px;"></div>
                        <div class="col-10 d-flex justify-content-center"></div>
                      </div>`;
  document.querySelector("#milestone-list").appendChild(ms_row);
  // add the save functionality and disable the Save milestone button by default -> need to add description at least
  var save_btn = document.getElementById(`save-ms-${new_ms_number}`);
  save_btn.addEventListener('click', () => save_milestone(roadmap_id, new_ms_number));
  save_btn.disabled = true;
  document.querySelector(`#new-desc-${new_ms_number}`).onkeyup = () => {
    if (document.querySelector(`#new-desc-${new_ms_number}`).value.length > 0) {
      save_btn.disabled = false;
    } else {
      save_btn.disabled = true;
    }
  }
  document.getElementById(`del-newms-${new_ms_number}`).addEventListener('click', () => del_protomilestone(new_ms_number));
  document.getElementById(`add-impact-${new_ms_number}`).addEventListener('click', () => add_impact(new_ms_number));
}

function save_milestone(roadmap_id, milestone_num) {
  // get the variables from the milestone div
  var new_milestone = document.getElementById(`new-milestone-${milestone_num}`);
  var desc = document.getElementById(`new-desc-${milestone_num}`).value;
  var plan_date = document.getElementById(`new-date-${milestone_num}`).value;

  // save the new milestone to the database using POST
  fetch('/milestone', {
    method: 'POST',
    body: JSON.stringify({
      number: milestone_num,
      desc: desc,
      plan_date: plan_date,
      realized: false,
      roadmap: roadmap_id
    })
  })
    .then(response => response.json())
    .then(result => {
      // get the new milestone's id from the result
      var milestone_id = result.id;

      // change the fields on the milestone div to show that the milestone has been saved
      var desc_div = document.getElementById(`new-desc-${milestone_num}`).parentElement;
      desc_div.innerHTML = '';
      desc_div.innerHTML = `${desc}`;

      var date_div = document.getElementById(`new-date-${milestone_num}`).parentElement;
      date_div.innerHTML = '';
      date_div.innerHTML = `${plan_date}`;

      document.getElementById(`new-fcst-${milestone_num}`).innerHTML = `<input type="date" class="input-field" id="fcst-date-${milestone_id}">`
      document.getElementById(`new-act-${milestone_num}`).innerHTML = `<div class="col-2 d-flex justify-content-center" style="padding:8px;"><input type="checkbox" id="act-${milestone_id}" value="false"></div>`;
      document.getElementById(`new-trash-${milestone_num}`).innerHTML = '';
      document.getElementById(`new-trash-${milestone_num}`).innerHTML = `<div class="col-1 d-flex justify-content-end"><div class="trash"><i class="fa fa-trash-o" id="del-${milestone_id}"></i></div></div>`
      document.getElementById('button-row').innerHTML = `<div class="col-1 d-flex justify-content-start"><input type="button" id="update-${milestone_id}" class="btn btn-primary btn-sm" value="Save"></div>`;
      document.getElementById(`update-${milestone_id}`).style.display = 'none';
      document.getElementById(`update-${milestone_id}`).addEventListener('click', () => save_changes(milestone_id));

      // check if the milestone has any impacts and if so, save those as well
      const new_impacts = new_milestone.querySelectorAll('.impact-row');
      const length = new_impacts.length;
      if (length > 0) {
        for (i = 0; i < length; i++) {
          var j = i + 1;
          var impact_type = document.getElementById(`impact-type-${j}`).value;
          var plan_amount = document.getElementById(`plan-value-${j}`).value;
          // after getting the values, delete the new-impact row
          var temp_impact = document.getElementById(`new-impact-${j}`);
          temp_impact.parentNode.removeChild(temp_impact);

          // save the new milestone's impacts using POST
          fetch('/postimpacts', {
            method: 'POST',
            body: JSON.stringify({
              milestone_id: milestone_id,
              impact_type: impact_type,
              plan_amount: plan_amount
            })
          })
            .then(response => response.json())
            .then(result => {
              const impact_id = result.id;
              const impact_text = result.impact_name;
              const plan_amount = result.plan_amount;
              var impact_row = document.createElement('div');
              impact_row.setAttribute("id", `imp-${impact_id}`);
              impact_row.setAttribute("style", 'background-color:white;margin:2px;padding-top:5px')
              impact_row.innerHTML = `<div class="row">
                                        <div class="col-1"></div>
                                        <div class="col-4 d-flex justify-content-end">${impact_text}</div>
                                        <div class="col-2 d-flex justify-content-center">${plan_amount}</div>
                                        <div class="col-2 d-flex justify-content-center"><input class="input-field" type="number" id="fcst-value-${impact_id}" value=""></div>
                                        <div class="col-2 d-flex justify-content-center"></div>
                                        <div class="col-1 d-flex justify-content-end"></div>
                                      </div>`;
              document.querySelector(`#new-milestone-${milestone_num}`).appendChild(impact_row);
            })
        }
      }
    })
}

function del_milestone(milestone_id) {
  var confirmation = confirm("Are you sure you want to delete the milestone?")
  if (confirmation == true) {
    var milestone = document.getElementById(`ms-${milestone_id}`)
    milestone.parentNode.removeChild(milestone);

    fetch('/milestone', {
      method: 'DELETE',
      body: JSON.stringify({
        milestone_id: milestone_id
      })
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
  } else {
    console.log("You pressed cancel");
  }
}

function add_impact(ms_number) {
  // check how many new impacts have been added and number the new one accordingly
  console.log(`Adding impact on milestone #${ms_number}`)
  const imp_numbers = document.querySelectorAll('.imp-number');
  const new_imp_number = imp_numbers.length + 1;
  var impact_row = document.createElement('div');
  impact_row.setAttribute("id", `new-impact-${new_imp_number}`)
  impact_row.classList.add("impact-row")
  impact_row.innerHTML = `<div class="row">
                            <div class="col-1"><div class="imp-number"></div></div>
                            <div class="col-4 d-flex justify-content-end"><select name="impact-type" id="impact-type-${new_imp_number}"></select></div>
                            <div class="col-2 d-flex justify-content-center"><input class="input-field" type="number" id="plan-value-${new_imp_number}"></div>
                            <div class="col-2 d-flex justify-content-center"></div>
                            <div class="col-2 d-flex justify-content-center"></div>
                            <div class="col-1 d-flex justify-content-end"><div class="trash" style="padding-right:15px"><i class="fa fa-trash-o" id="del-newimp-${new_imp_number}"></i></div></div>
                          </div>`;
  document.querySelector(`#new-milestone-${ms_number}`).appendChild(impact_row);
  // get the impact types for the drop-down
  fetch('/impact_types')
    .then(response => response.json())
    .then(types => {
      var type_dropdown = document.getElementById(`impact-type-${new_imp_number}`);
      const length = types.length;
      for (i = 0; i < length; i++) {
        var type_id = types[i].id;
        var type_name = types[i].name;
        type_dropdown.innerHTML += `<option value="${type_id}">${type_name}</option>`;
      }
    })
  document.getElementById(`del-newimp-${new_imp_number}`).addEventListener('click', () => del_protoimpact(new_imp_number))
}

function del_impact(impact_id) {
  var conf = confirm("Are you sure you want to delete the milestone?")
  if (conf == true) {
    var impact = document.getElementById(`imp-${impact_id}`)
    impact.parentNode.removeChild(impact);

    fetch('/postimpacts', {
      method: 'DELETE',
      body: JSON.stringify({
        impact_id: impact_id
      })
    })
      .then(response => response.json())
      .then(result => {
        console.log(result);
      })
  }
}

function save_changes(milestone_id) {
  // get the forecast date and actual status from the div
  var plan_date = document.getElementById(`plan-date-${milestone_id}`).innerHTML;
  var fcst_date = document.getElementById(`fcst-date-${milestone_id}`).value;
  var realized = document.getElementById(`act-${milestone_id}`).checked;

  // PUT changes to the milestone
  fetch('/milestone', {
    method: 'PUT',
    body: JSON.stringify({
      milestone_id: milestone_id,
      plan_date: plan_date,
      fcst_date: fcst_date,
      realized: realized,
    })
  })
    .then(response => response.json())
    .then(result => {
      if (realized == false) {
        // get the new milestone's id from the result
        var milestone_realized = result.realized;
        // if the milestone has not realized
        document.getElementById(`fcst-date-${milestone_id}`).setAttribute('value', fcst_date);
        // add the normal functionality to the the update button                
        const fcst_input = document.getElementById(`fcst-date-${milestone_id}`);
        fcst_input.oninput = () => {
          if (fcst_input.value != result.forecast_amount) {
            document.getElementById(`update-${milestone_id}`).style.display = 'block';
          } else {
            document.getElementById(`update-${milestone_id}`).style.display = 'none';
          }
        }
      } else {
        // fix the forecast date value and disable the checkbox to signify that this milestone is now done
        if (fcst_date == '') {
          document.getElementById(`fcst-date-div-${milestone_id}`).innerHTML = plan_date;
        } else {
          document.getElementById(`fcst-date-div-${milestone_id}`).innerHTML = fcst_date;
        }
        document.getElementById(`act-${milestone_id}`).checked = true;
        document.getElementById(`act-${milestone_id}`).disabled = true;
      }

      // if milestone has impact-rows, loop through those and save changes using PUT
      var milestone_div = document.getElementById(`ms-${milestone_id}`);
      const impact_rows = milestone_div.querySelectorAll('.impact-row');
      const length = impact_rows.length;
      if (length > 0) {
        for (i = 0; i < length; i++) {
          const impact_id = parseInt(impact_rows[i].id);
          const plan_value = parseInt(document.getElementById(`plan-value-${impact_id}`).innerHTML);
          const fcst_value = parseInt(document.getElementById(`fcst-value-${impact_id}`).value);
          const imp_type = document.getElementById(`imp-type-${impact_id}`).innerHTML;
          // PUT the changes to the impact
          fetch('/postimpacts', {
            method: 'PUT',
            body: JSON.stringify({
              impact_id: impact_id,
              imp_type: imp_type,
              plan_value: plan_value,
              fcst_value: fcst_value,
              milestone_id: milestone_id,
              realized: milestone_realized,
            })
          })
            .then(response => response.json())
            .then(result => {
              if (milestone_realized == false) {
                // if milestone is not done, update the value of the fcst field
                if (result.forecast_amount == null) {
                  document.getElementById(`fcst-value-${result.id}`).setAttribute('value', 0)
                } else {
                  document.getElementById(`fcst-value-${result.id}`).setAttribute('value', result.forecast_amount)
                }
                // add the normal functionality to the the update button                
                const fcst_input = document.getElementById(`fcst-value-${result.id}`);
                fcst_input.oninput = () => {
                  if (fcst_input.value != result.forecast_amount) {
                    document.getElementById(`update-${milestone_id}`).style.display = 'block';
                  } else {
                    document.getElementById(`update-${milestone_id}`).style.display = 'none';
                  }
                }
              } else {
                if (result.forecast_amount == '') {
                  document.getElementById(`fcst-value-div-${impact_id}`).innerHTML = plan_value;
                } else {
                  document.getElementById(`fcst-value-div-${impact_id}`).innerHTML = result.forecast_amount;
                }
              }
            })
        }
      }
      // hide the update button
      document.getElementById(`update-${milestone_id}`).style.display = 'none';
    })
}


function del_protomilestone(ms_number) {
  console.log(`Deleting milestone prototype ${ms_number}`)
  var milestone_proto = document.getElementById(`new-milestone-${ms_number}`)
  milestone_proto.parentNode.removeChild(milestone_proto);
}


function del_protoimpact(impact_number) {
  console.log(`Deleting impact prototype ${impact_number}`)
  var impact_proto = document.getElementById(`new-impact-${impact_number}`)
  impact_proto.parentNode.removeChild(impact_proto);
}


function view_profile(username) {
  if (document.querySelector('#mgmt-view') != null) {
    document.querySelector('#mgmt-view').style.display = 'none';
  }
  document.querySelector('#edit-view').style.display = 'none';
  document.querySelector("#roadmap-view").style.display = 'none';
  document.querySelector("#milestone-list").style.display = 'none';
  document.querySelector("#profile-view").style.display = 'block';
  document.querySelector("#password-change").style.display = 'none';

  document.querySelector("#username-view").innerHTML = `<h5 id="profile-h5">Profile view: ${username}</h5>`;
  document.querySelector("#user-info").innerHTML = '';
  document.getElementById('save-prof-changes').disabled = true;

  document.getElementById('pw-change').addEventListener('click', () => password_view());

  //save the form fields to variables
  var userid = document.querySelector("#user-id");
  var firstname = document.querySelector("#firstname");
  var lastname = document.querySelector("#lastname");
  var email = document.querySelector("#email")
  var phone = document.querySelector("#phone")

  fetch(`/profile/${username}`)
    .then(response => response.json())
    .then(result => {
      userid.innerHTML = result.id;
      firstname.setAttribute("value", result.first_name);
      lastname.setAttribute("value", result.last_name);
      email.setAttribute("value", result.email);
      phone.setAttribute("value", result.phone);

      // attach the save changes functionality to the button and abel it if changes are made
      var save_prof_changes = document.getElementById('save-prof-changes');
      save_prof_changes.addEventListener('click', () => save_profile(username));
      firstname.oninput = () => {
        if (firstname.value != result.first_name && firstname.value.length > 0) {
          save_prof_changes.disabled = false;
        } else {
          save_prof_changes.disabled = true;
        }
      }
      lastname.oninput = () => {
        if (lastname.value != result.last_name && lastname.value.length > 0) {
          save_prof_changes.disabled = false;
        } else {
          save_prof_changes.disabled = true;
        }
      }
      email.oninput = () => {
        if (email.value != result.email && email.value.length > 0) {
          save_prof_changes.disabled = false;
        } else {
          save_prof_changes.disabled = true;
        }
      }
      phone.oninput = () => {
        if (phone.value != result.phone && phone.value.length > 0) {
          save_prof_changes.disabled = false;
        } else {
          save_prof_changes.disabled = true;
        }
      }
      if (result.last_login == null) {
        var last_login = '';
      } else {
        var last_login = result.last_login;
      }

      var row = document.createElement('div');
      row.classList.add("container.fluid");
      row.innerHTML = `<div class="row">
                        <div class="col-3" style="color:gray;font-weight:bold">Last login:</div>
                        <div class="col">${last_login}</div>
                      </div>
                      <div class="row">
                        <div class="col-3" style="color:gray;font-weight:bold">Role:</div>
                        <div class="col">${result.role}</div>
                      </div>
                    </div>
                    <hr>`;
      document.querySelector('#user-info').appendChild(row);
      // get all the programs the user is an admin of, if a program admin
      if (result.role == 'Program admin') {
        // get the programs of which the the user is admin
        fetch('/programs')
          .then(response => response.json())
          .then(programs => {
            if (programs.length > 0) {
              var prog_headline = document.createElement('h6');
              prog_headline.innerHTML = 'Programs<br>';
              prog_headline.classList.add('profile-h6');
              document.querySelector('#user-info').appendChild(prog_headline);
            }
            programs.forEach(program => {
              var prog_row = document.createElement('div');
              prog_row.classList.add("container.fluid");
              prog_row.innerHTML = `<div class="row">
                                <div class="col">${program.fields.name}</div>
                              </div>`;
              document.querySelector('#user-info').appendChild(prog_row);
            })
            var hr = document.createElement('hr')
            document.querySelector('#user-info').appendChild(hr);
          })
      }
      if (result.role == 'Program admin ' || result.role == 'Stream admin') {
        // get all the programs the user is an owner of, if a program/stream admin
        fetch('/streams')
          .then(response => response.json())
          .then(streams => {
            if (streams.length > 0) {
              var str_headline = document.createElement('h6');
              str_headline.classList.add('profile-h6');
              str_headline.innerHTML = 'Streams<br>';
              document.querySelector('#user-info').appendChild(str_headline);
            }
            streams.forEach(stream => {
              var str_row = document.createElement('div');
              str_row.classList.add("container.fluid");
              str_row.innerHTML = `<div class="row">
                                <div class="col">${stream.fields.name}</div>
                              </div>`;
              document.querySelector('#user-info').appendChild(str_row);
            })
            var hr = document.createElement('hr')
            document.querySelector('#user-info').appendChild(hr);
          })
      }
      if (result.role == 'Program admin ' || result.role == 'Stream admin' || result.role == 'Roadmap owner')
        // get the user's roadmaps
        fetch('/roadmaps')
          .then(response => response.json())
          .then(roadmaps => {
            if (roadmaps.length > 0) {
              var rm_headline = document.createElement('h6');
              rm_headline.classList.add('profile-h6');
              rm_headline.innerHTML = 'Roadmaps<br>';
              document.querySelector('#user-info').appendChild(rm_headline);
            }
            roadmaps.forEach(roadmap => {
              var rm_row = document.createElement('div');
              rm_row.classList.add("container.fluid");
              rm_row.innerHTML = `<div class="row">
                                <div class="col"><span id="rm-${roadmap.id}" class="prof-rm">${roadmap.name}</span></div>
                              </div>`;
              document.querySelector('#user-info').appendChild(rm_row);
              document.getElementById(`rm-${roadmap.id}`).addEventListener('click', () => load_roadmap(roadmap.id));
            })
          })
    })
}

function save_profile(username) {
  var user_id = document.querySelector("#user-id").innerHTML;
  var firstname = document.querySelector("#firstname").value;
  var lastname = document.querySelector("#lastname").value;
  var email = document.querySelector("#email").value;
  var phone = document.querySelector("#phone").value;

  fetch('/editprofile', {
    method: 'PUT',
    body: JSON.stringify({
      user_id: user_id,
      username: username,
      firstname: firstname,
      lastname: lastname,
      email: email,
      phone: phone
    })
  })
    .then(response => response.json())
    .then(result => {
      view_profile(username);
      document.getElementById('profile-message').innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.message}
                                                                <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                                  <span aria-hidden="true">&times;</span>
                                                                </button>
                                                              </div>`;
    })
  event.preventDefault();
}


function password_view() {
  document.querySelector("#password-change").style.display = 'block';
  document.getElementById('close').addEventListener('click', () => document.querySelector("#password-change").style.display = 'none');
  document.getElementById('update-password').addEventListener('click', () => change_password());
}


function change_password() {
  // save the values of those fields to variables
  var user_id = document.querySelector("#user-id").innerHTML;
  var old_password = document.querySelector("#old-password").value;
  var new_password = document.querySelector("#new-password").value;
  var confirmation = document.querySelector("#confirmation").value;

  // pass those variables to the API in POST
  fetch('/password', {
    method: 'POST',
    body: JSON.stringify({
      user_id: user_id,
      old_password: old_password,
      new_password: new_password,
      confirmation: confirmation
    })
  })
    .then(response => response.json())
    .then(result => {
      if ("error" in result) {
        // display the error in the message div and empty all the fields
        document.getElementById('pw-message').innerHTML = `<div class="alert alert-danger alert-dismissible fade show" role="alert">${result.error}
                                                              <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                                <span aria-hidden="true">&times;</span>
                                                              </button>
                                                            </div>`;
        document.querySelector("#old-password").value = '';
        document.querySelector("#new-password").value = '';
        document.querySelector("#confirmation").value = '';
      } else {
        // display message in another div, empty all the fields, and hide the password view
        document.getElementById('profile-message').innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.message}
                                                                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                                    <span aria-hidden="true">&times;</span>
                                                                  </button>
                                                                </div>`;
        document.querySelector("#old-password").value = '';
        document.querySelector("#new-password").value = '';
        document.querySelector("#confirmation").value = '';
        document.querySelector("#password-change").style.display = 'none';
      }
    })
  event.preventDefault();
}


function load_treeview(program_id, program_name) {
  document.querySelector("#impact-table").innerHTML = '';
  var treeview = document.getElementById('treeview-view');
  treeview.innerHTML = '';
  document.querySelector("#btn-row").style.display = 'block';
  // set the first node in the treeview as the program
  var treeview_ul = document.createElement('ul');
  treeview_ul.setAttribute('id', 'treeview');
  treeview_ul.innerHTML = `<li><span class="caret">${program_name}</span>
                            <ul id="stream-list" class="nested"></ul>
                          </li>`;
  treeview.appendChild(treeview_ul);

  document.getElementById('treeview').addEventListener('click', () => load_impacttable(program_id, program_name, 'program'));

  // get all the streams within the program that are under the admin
  fetch(`/streams/${program_id}`)
    .then(response => response.json())
    .then(streams => {
      streams.forEach(stream => {
        // get the program caret
        var str_list = document.getElementById('stream-list');
        // if no parent stream, goes underneath the program caret
        if (stream.fields.parent == null) {
          // create a stream-item element
          var str_row = document.createElement('li');
          str_row.setAttribute('id', `stream-${stream.pk}`);
          str_row.innerHTML = `<span class="caret">${stream.fields.name}</span>
                                <ul id="nested-${stream.pk}" class="nested"></ul> `;
          // add to the program parent element and attach the load_impacttable function (when clicked)
          str_list.appendChild(str_row);
          document.getElementById(`stream-${stream.pk}`).addEventListener('click', () => load_impacttable(stream.pk, stream.fields.name, 'stream'));
        } else {
          // goes underneath the appropriate stream
          var prnt_str = document.getElementById(`nested-${stream.fields.parent}`);
          // create a stream-item element
          var str_row = document.createElement('li');
          str_row.setAttribute('id', `stream-${stream.pk}`);
          str_row.innerHTML = `<span class="caret">${stream.fields.name}</span>
                                <ul id="nested-${stream.pk}" class="nested"></ul> `;
          // add to the program parent element and attach the load_impacttable function (when clicked)
          prnt_str.appendChild(str_row);
          document.getElementById(`stream-${stream.pk}`).addEventListener('click', () => load_impacttable(stream.pk, stream.fields.name, 'stream'));
        }
        // get all the roadmaps underneath and attach the load_roadmap function (when clicked)
        fetch(`/roadmaps/${stream.pk}`)
          .then(response => response.json())
          .then(roadmaps => {
            if (roadmaps.length != 0) {
              var str_head = document.getElementById(`nested-${stream.pk}`);
              roadmaps.forEach(roadmap => {
                const rm_row = document.createElement('li');
                rm_row.setAttribute('id', `roadmap-${roadmap.pk}`)
                rm_row.classList.add('prof-rm');
                rm_row.innerHTML = '- ' + roadmap.fields.name;
                str_head.appendChild(rm_row);
                document.getElementById(`roadmap-${roadmap.pk}`).addEventListener('click', () => load_roadmap(roadmap.pk));
              })
            }
          })
      })
      // attach the dropdown functionality to the treeview itself
      var toggler = document.getElementsByClassName("caret");
      var i;

      for (i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener("click", function () {
          this.parentElement.querySelector(".nested").classList.toggle("active");
          this.classList.toggle("caret-down");
        });
      }
    })
}


function load_impacttable(id, name, type) {
  document.querySelector("#roadmap-view").innerHTML = '';
  document.querySelector("#roadmap-view").style.display = 'none';
  document.querySelector("#milestone-list").innerHTML = '';
  document.querySelector("#milestone-list").style.display = 'none';

  // first, removes all the eventListener from buttons, then goes through them and sets new listener
  var btn_row = document.getElementById('btn-row');
  btn_row.outerHTML = btn_row.outerHTML;
  document.getElementById('delete-roadmap').disabled = true;
  document.getElementById('crete-stream').disabled = false;
  document.getElementById('crete-stream').addEventListener('click', () => create_stream(id, type));

  document.getElementById('export-data').disabled = false;
  document.getElementById('export-data').addEventListener('click', () => export_data(id, type));

  // you can only create roadmaps under streams adn delete selected streams
  if (type == 'stream') {
    document.getElementById('create-roadmap').disabled = false;
    document.getElementById('create-roadmap').addEventListener('click', () => create_roadmap(id, name));
    document.getElementById('delete-stream').disabled = false;
    document.getElementById('delete-stream').addEventListener('click', () => delete_stream(id, name));
  } else {
    document.getElementById('create-roadmap').disabled = true;
    document.getElementById('delete-stream').disabled = true;
  }

  // display the data as a table showing all the impact types and their Plan, Fcst, and Realized values
  document.querySelector("#program-name").innerHTML = `<h6>${name}</h6>`;
  var impact_table = document.querySelector("#impact-table");
  impact_table.style.display = 'block';
  impact_table.innerHTML = '';
  impact_table.innerHTML = `Showing the impact table for ${type} ${name} id: ${id}`;
  console.log(type);
  console.log(id);
  console.log(name);
  // get the data from the backend
  fetch('/impacts', {
    method: 'POST',
    body: JSON.stringify({
      type: type,
      id: id
    })
  })
    .then(response => response.json())
    .then(result => {
      console.log(result.message);
    })
  event.stopPropagation();
}


function create_stream(id, type) {
  // hide and empty all the necessary views
  document.getElementById('impact-table').style.display = 'none';
  document.getElementById('impact-table').innerHTML = '';
  document.getElementById('roadmap-view').style.display = 'none';
  document.getElementById('roadmap-view').innerHTML = '';
  document.getElementById('edit-view').style.display = 'none';
  document.getElementById('edit-view').innerHTML = '';
  document.getElementById('milestone-list').style.display = 'none';
  document.getElementById('milestone-list').innerHTML = '';
  document.getElementById('profile-view').style.display = 'none';
  document.getElementById('profile-view').innerHTML = '';
  document.getElementById('new-roadmap-view').style.display = 'none';
  document.getElementById('new-roadmap-view').innerHTML = '';
  // disable all the buttons
  var btn_row = document.getElementById('btn-row');
  var buttons = btn_row.getElementsByTagName('button');
  for (i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }

  // open and clear the new-stream-view
  var new_str_view = document.getElementById('new-stream-view');
  new_str_view.style.display = 'block';
  new_str_view.innerHTML = '';
  new_str_view.innerHTML = `<small><i>Creating a stream underneath ${type} id: ${id}</i></small>`;

  // create the form in JavaScript
  var new_str_div = document.createElement('div');
  new_str_div.classList.add('container-new-str');
  new_str_div.setAttribute('id', 'new-stream');
  new_str_div.innerHTML = `<form id="new-rm-form">
                              <label for="name">Stream name:</label><br>
                              <input type="text" id="name" name="name" style="width:400px;"><br>
                              <label for="admin">Admin:</label><br>
                              <select id="admin" name="admin"></select><br>
                              <br>
                              <input type="submit" id="save-new-str" class="btn btn-primary" value="Save Stream"><br>
                            </form>`;
  new_str_view.appendChild(new_str_div);

  // get admin information to the dropdown
  var admin_dropdown = document.getElementById('admin');
  fetch('/profiles')
    .then(response => response.json())
    .then(profiles => {
      profiles.forEach(profile => {
        admin_dropdown.innerHTML += `<option value="${profile.userid}">${profile.full_name}</option>`;
      })
    })
  //add the save functionality to the button
  document.getElementById('save-new-str').addEventListener('click', () => save_stream(id, type));
  event.stopPropagation();
}


function save_stream(id, type) {
  if (type == 'program') {
    var program = id;
    var parent = '';
  } else {
    var parent = id;
    var program = '';
  }
  var name = document.getElementById('name').value;
  var admin = document.getElementById('admin').value;
  var admin = parseInt(admin);

  console.log(name);
  console.log(admin);
  console.log(program);
  console.log(parent);

  // post the data from the form
  fetch('/stream', {
    method: 'POST',
    body: JSON.stringify({
      name: name,
      admin: admin,
      program: program,
      parent: parent,
    })
  })
    .then(response => response.json())
    .then(result => {
      document.getElementById('new-stream-view').innerHTML = '';
      document.getElementById('new-stream-view').style.display = 'none';
      // get the new roadmap's id from the response
      var stream_id = result.id;
      // add the new roadmap to the treeview depending on whether it has a parent or not
      if (parent == '') {
        var stream_list = document.getElementById(`stream-list`);
        var stream = document.createElement('li');
        stream.setAttribute('id', `stream-${stream_id}`);
        stream.innerHTML = `<span class="caret">${name}</span>
                            <ul id="nested-${stream_id}" class="nested"></ul> `;
        stream_list.appendChild(stream);
      } else {
        var parent_str = document.getElementById(`nested-${parent}`);
        var stream = document.createElement('li');
        stream.setAttribute('id', `stream-${stream_id}`);
        stream.innerHTML = `<span class="caret">${name}</span>
                            <ul id="nested-${stream_id}" class="nested"></ul> `;
        parent_str.appendChild(stream);
      }
      // display a success message to the user
      document.getElementById('mgmt-message').innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.message}
                                                            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                              <span aria-hidden="true">&times;</span>
                                                            </button>
                                                          </div>`;
      // add to the program parent element and attach the load_impacttable function (when clicked) + the caret functionality
      document.getElementById(`stream-${stream_id}`).addEventListener('click', () => load_impacttable(stream_id, name, 'stream'));
      // attach the dropdown functionality to the treeview itself
      var toggler = document.getElementsByClassName("caret");
      var i;

      for (i = 0; i < toggler.length; i++) {
        toggler[i].addEventListener("click", function () {
          this.parentElement.querySelector(".nested").classList.toggle("active");
          this.classList.toggle("caret-down");
        });
      }
    })
  event.preventDefault();
}


function delete_stream(stream_id, stream_name) {
  var confirmation = confirm(`Are you sure you want to delete ${stream_name}?`)
  if (confirmation == true) {
    // delete the stream using POST
    fetch('/stream', {
      method: 'DELETE',
      body: JSON.stringify({
        stream_id: stream_id
      })
    })
      // remove the stream from the treeview
      .then(response => response.json())
      .then(result => {
        // remove the roadmap from the treeview and clear & hide the roadmap view 
        var stream = document.getElementById(`stream-${stream_id}`)
        stream.parentNode.removeChild(stream);
        document.getElementById(`impact-table`).innerHTML = '';
        // flash message for the user
        document.getElementById('mgmt-message').innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.message}
                                                                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                                    <span aria-hidden="true">&times;</span>
                                                                  </button>
                                                                </div>`;
        document.getElementById('delete-stream').disabled = true;
        document.getElementById('create-roadmap').disabled = true;
      })
  } else {
    console.log(`Canceled the deletion of stream ${stream_id}`)
  }
}


function create_roadmap(stream_id, stream_name) {
  console.log(`Creating a roadmap underneath stream ${stream_name} id: ${stream_id}`);
  // hide and empty impact-table, roadmap-view, edit-view, milestone-list, and profile-view
  document.getElementById('impact-table').style.display = 'none';
  document.getElementById('impact-table').innerHTML = '';
  document.getElementById('roadmap-view').style.display = 'none';
  document.getElementById('roadmap-view').innerHTML = '';
  document.getElementById('edit-view').style.display = 'none';
  document.getElementById('edit-view').innerHTML = '';
  document.getElementById('milestone-list').style.display = 'none';
  document.getElementById('milestone-list').innerHTML = '';
  document.getElementById('profile-view').style.display = 'none';
  document.getElementById('profile-view').innerHTML = '';
  // disable all the buttons
  var btn_row = document.getElementById('btn-row');
  var buttons = btn_row.getElementsByTagName('button');
  for (i = 0; i < buttons.length; i++) {
    buttons[i].disabled = true;
  }

  // open and clear all the fields of new-roadmap-view
  var new_rm_view = document.getElementById('new-roadmap-view');
  new_rm_view.style.display = 'block';
  new_rm_view.innerHTML = '';
  new_rm_view.innerHTML = `<small><i>Creating a roadmap underneath stream ${stream_name} id: ${stream_id}</i></small>`;

  // create the form in JavaScript
  var new_rm_div = document.createElement('div');
  new_rm_div.classList.add('container-new-rm');
  new_rm_div.setAttribute('id', 'new-roadmap');
  new_rm_div.innerHTML = `<form id="new-rm-form">
                            <label for="name">Roadmap name:</label><br>
                            <input type="text" id="name" name="name" style="width:400px;"><br>
                            <label for="owner">Owner:</label><br>
                            <select id="owner" name="owner"></select><br>
                            <label for="desc">Description:</label><br>
                            <textarea id="desc" rows="4" cols="55" name="desc" form="new-rm-form"></textarea><br>
                            <label for="country">Country:</label><br>
                            <select id="country" name="country"></select><br>
                            <label for="region">Region:</label><br>
                            <select id="region" name="region"></select><br>
                            <br>
                            <input type="submit" id="save-new-rm" class="btn btn-primary" value="Save Roadmap"><br>
                          </form>`;
  new_rm_view.appendChild(new_rm_div);

  // get owner, country, and region information to the dropdowns
  var owner_dropdown = document.getElementById('owner');
  fetch('/profiles')
    .then(response => response.json())
    .then(profiles => {
      profiles.forEach(profile => {
        owner_dropdown.innerHTML += `<option value="${profile.userid}">${profile.full_name}</option>`;
      })
    })

  var region_dropdown = document.getElementById('region');
  fetch('/regions')
    .then(response => response.json())
    .then(result => {
      const regions = result.regions;
      var length = Object.keys(regions).length;
      for (i = 1; i < length + 1; i++) {
        var region = regions[i];
        region_dropdown.innerHTML += `<option value="${region}">${region}</option>`;
      }
    })

  // get list of countries and add them to the edit-country dropdown
  var country_dropdown = document.getElementById('country');
  fetch('/countries')
    .then(response => response.json())
    .then(countries => {
      var length = Object.keys(countries).length;
      for (k = 1; k < length + 1; k++) {
        country_dropdown.innerHTML += `<option value="${countries[k].code}">${countries[k].name}</option>`;
      }
    })

  //add the save functionality to the button
  document.getElementById('save-new-rm').addEventListener('click', () => save_roadmap(stream_id));
}

function save_roadmap(stream_id) {
  console.log(`Saving roadmap in stream ${stream_id}!`)
  // get the data from the form fields
  var name = document.getElementById('name').value;
  var owner = document.getElementById('owner').value;
  var desc = document.getElementById('desc').value;
  var country = document.getElementById('country').value;
  var region = document.getElementById('region').value;
  // post the data from the form
  fetch('/roadmap', {
    method: 'POST',
    body: JSON.stringify({
      name: name,
      stream_id: stream_id,
      owner: owner,
      desc: desc,
      country: country,
      region: region
    })
  })
    .then(response => response.json())
    .then(result => {
      document.getElementById('new-roadmap-view').innerHTML = '';
      document.getElementById('new-roadmap-view').style.display = 'none';
      // get the new roadmap's id from the response
      var roadmap_id = result.id;
      // add the new roadmap to the treeview
      var stream = document.getElementById(`nested-${stream_id}`);
      var roadmap = document.createElement('li');
      roadmap.classList.add('prof-rm')
      roadmap.setAttribute('id', `roadmap-${roadmap_id}`);
      roadmap.innerHTML = `- ${name}`;
      stream.appendChild(roadmap);
      document.getElementById(`roadmap-${roadmap_id}`).addEventListener('click', () => load_roadmap(roadmap_id));
      // display a success message to the user
      document.getElementById('mgmt-message').innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.message}
                                                                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                                    <span aria-hidden="true">&times;</span>
                                                                  </button>
                                                                </div>`;
    })
  event.preventDefault();
}

function delete_roadmap(roadmap_id) {
  var confirmation = confirm("Are you sure you want to delete this roadmap?")
  if (confirmation == true) {
    // delete the roadmap
    fetch('/editroadmap', {
      method: 'DELETE',
      body: JSON.stringify({
        roadmap_id: roadmap_id
      })
    })
      .then(response => response.json())
      .then(result => {
        // remove the roadmap from the treeview and clear & hide the roadmap view 
        var roadmap = document.getElementById(`roadmap-${roadmap_id}`)
        roadmap.parentNode.removeChild(roadmap);
        document.getElementById(`roadmap-view`).innerHTML = '';
        document.getElementById(`roadmap-view`).style.display = 'none';
        // flash message to the user
        document.getElementById('mgmt-message').innerHTML = `<div class="alert alert-success alert-dismissible fade show" role="alert">${result.message}
                                                                  <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                                                                    <span aria-hidden="true">&times;</span>
                                                                  </button>
                                                                </div>`;
        document.getElementById('delete-roadmap').disabled = true;
      })
  } else {
    console.log(`Canceled the deletion of roadmap ${roadmap_id}`)
  }
}

function export_data(id, type) {
  if (type == 'program') {
    console.log(`Exporting data for ${type} ${id}`);
  } else {
    console.log(`Exporting data for ${type} ${id}`);
  }
}