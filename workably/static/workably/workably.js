document.addEventListener('DOMContentLoaded', function () {
  // document.querySelector('#roadmap-dropdown').addEventListener('click', () => load_roadmaps())


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
  document.querySelector("#roadmap-view").innerHTML = '';
  document.querySelector("#milestone-list").innerHTML = '<h6>Milestones<h6>';
  fetch(`/roadmap/${roadmap_id}`)
    .then(response => response.json())
    .then(result => {

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


      var info = document.createElement('div');
      info.classList.add("container");
      info.innerHTML = `<div class="row">
                          <div class="col"><h6>${result[0].fields.name}</h6></div>
                          <div class="col" style="color:darkgray;text-align:right;"><i><small>Created on: ${result[0].fields.created_on}</small></i></div>
                        </div>
                        <div class="row">
                          <div id="owner-name" class="col"></div>
                          <div class="col" style="color:darkgray;text-align:right;"><i><small>Last updated on: ${last_updated}</small></i></div>
                        </div>
                        <div class="row">
                          <div class="col-10">${result[0].fields.description}</div>
                          <div class="col" style="color:darkgray;text-align:right;"><i><small>By: ${last_updater}</small></i></div>
                        </div>
                        <div class="row">
                          <div class="col">${result[0].fields.country}, ${result[0].fields.region}</div>
                          <div id="edit-${roadmap_id}" class="col-2"><div class="edit" style="color:blue;text-align:right;">Edit</div></div>
                        </div>`;
      document.querySelector("#roadmap-view").appendChild(info);
      // add ability to edit the roadmap's basic info
      document.getElementById(`edit-${roadmap_id}`).addEventListener('click', () => edit_roadmap(roadmap_id));

      // get user information for the roadmap-info view
      fetch(`/user/${result[0].fields.owner}`)
        .then(response => response.json())
        .then(user => {
          document.getElementById('owner-name').innerHTML = 'Owner: ' + user[0].fields.first_name + " " + user[0].fields.last_name;
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

            var ms_row = document.createElement('div');
            ms_row.classList.add("container");
            ms_row.innerHTML = `
                                <div class="row">
                                  <div class="col-1"><small>#</small></div>
                                  <div class="col-4"><small>Description</small></div>
                                  <div class="col-2"><small>Plan</small></div>
                                  <div class="col-2"><small>Forecast</small></div>
                                  <div class="col-2"><small>Realized</small></div>
                                  <div class="col-1"><small></small></div>
                                </div>
                                <div class="row">
                                  <div class="col-1">${milestone.number}</div>
                                  <div class="col-4">${milestone.description}</div>
                                  <div class="col-2">${plan_date}</div>
                                  <div class="col-2">${forecast_date}</div>
                                  <div class="col-2"><input type="checkbox" id="act-${milestone.id}"></div>
                                  <div class="col-1" id="del-${milestone.id}"><i class="fa fa-trash-o"></i></div>
                                </div>`;
            document.querySelector("#milestone-list").appendChild(ms_row);
            document.getElementById(`act-${milestone.id}`).checked = milestone.realized;
          });
          // add milestone button
        })
    })
}

function edit_roadmap(roadmap_id) {
  console.log(roadmap_id);
  console.log(typeof roadmap_id);
}