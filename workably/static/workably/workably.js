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
              var forecast_col = forecast_date
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
                                  <div class="col-2 d-flex justify-content-center">${plan_date}</div>
                                  <div class="col-2 d-flex justify-content-center">${forecast_col}</div>
                                  <div class="col-2 d-flex justify-content-center" style="padding:8px;"><input type="checkbox" id="act-${milestone.id}"></div>
                                  <div class="col-1 d-flex justify-content-end"><div class="trash"><i class="fa fa-trash-o" id="del-${milestone.id}"></i></div></div>
                                </div>
                                <div class="row>
                                  <div class="col-1 d-flex justify-content-start"><input type="button" id="update-${milestone.id}" class="btn btn-primary btn-sm" value="Save"></div>
                                </div>`;
            document.querySelector("#milestone-list").appendChild(ms_row);
            document.getElementById(`act-${milestone.id}`).checked = milestone.realized;
            document.getElementById(`del-${milestone.id}`).addEventListener('click', () => del_milestone(milestone.id));
            document.getElementById(`update-${milestone.id}`).style.display = 'none';

            document.querySelector(`#fcst-date-${milestone.id}`).oninput = () => {
              if (document.querySelector(`#fcst-date-${milestone.id}`).value.length > 0) {
                document.getElementById(`update-${milestone.id}`).style.display = 'block';
              } else {
                document.getElementById(`update-${milestone.id}`).style.display = 'none';
              }
            }

            document.querySelector(`#act-${milestone.id}`).oninput = () => {
              if (document.querySelector(`#act-${milestone.id}`).value != milestone.realized) {
                document.getElementById(`update-${milestone.id}`).style.display = 'block';
              }
            }

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
      // check if the milestone has any impacts and if so, save those as well
      const new_impacts = new_milestone.querySelectorAll('.impact-row');
      const length = new_impacts.length;
      if (length > 0) {
        for (i = 0; i < length; i++) {
          var j = i + 1;
          var impact_type = document.getElementById(`impact-type-${j}`).value;
          var sel = document.getElementById(`impact-type-${j}`).innerHTML;
          var impact_text = sel.options[sel.selectedIndex].text;
          var plan_amount = document.getElementById(`plan-value-${j}`).value;

          console.log(impact_text);

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
              var impact_row = document.createElement('div');
              impact_row.setAttribute("id", `imp-${impact_id}`);
              impact_row.setAttribute("style", 'background-color:white;margin:2px;padding-top:5px')
              impact_row.innerHTML = `<div class="row">
                                        <div class="col-1"></div>
                                        <div class="col-4 d-flex justify-content-end">${impact_text}</div>
                                        <div class="col-2 d-flex justify-content-center">${plan_amount}</div>
                                        <div class="col-2 d-flex justify-content-center"><input class="input-field" type="number" id="fcst-value-${impact_id}" value=""></div>
                                        <div class="col-2 d-flex justify-content-center"></div>
                                        <div class="col-1 d-flex justify-content-end"><div class="trash" style="padding-right:15px"><i class="fa fa-trash-o" id="del-${impact_id}"></i></div></div>
                                      </div>`;
              document.querySelector(`#new-milestone-${milestone_num}`).appendChild(impact_row);
              document.getElementById(`del-${impact_id}`).addEventListener('click', () => del_impact(`${impact_id}`));
              var temp_impact = document.getElementById(`new-impact-${j}`)
              temp_impact.parentNode.removeChild(impact);
            })
        }
      }
    })
}

function del_milestone(milestone_id) {
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
}

function add_impact(ms_number) {
  // check how many new impacts have been added and number the new one accordingly
  console.log(`Adding impact on milestone #${ms_number}`)
  const imp_numbers = document.querySelectorAll('.imp-number');
  const new_imp_number = imp_numbers.length + 1;
  var impact_row = document.createElement('div');
  impact_row.setAttribute("id", `new-impact-${new_imp_number}`)
  impact_row.classList.add("impact-row")
  impact_row.setAttribute("style", 'background-color:white;margin:2px;padding-top:5px')
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

function save_changes(roadmap_id) {
  console.log(`Saving changes to roadmap ${roadmap_id}`)
  // load_roadmap(roadmap_id);
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