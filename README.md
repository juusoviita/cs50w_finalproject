## Workably
I work as a business analyst for a large, multinational industrial firm and my job includes the management, reporting and following of post M&A programs, i.e. business integrations. So far, we've used a reporting tool provided to us by an unnamed management consulting firm, whose origins may or may not be too far from Cambridge, MA. The tool is relatively simple, and therefore I thought that instead of continuing to use theirs, I could create my own version of it, simplyfying it to its bare essentials for our needs. That was the impetus for Workably, my submission for the Final project.

A video demoing the features can be found here: https://youtu.be/WtwTOSWU7a8

Workably allows you to follow up on your post-M&A integration (and other) programs and their financial impacts in a simple and structured way. A program is into multiple streams, often aligned with the structure of the organization, which can then be split into substreams, and subsubstreams, and... (Sub)streams then contain roadmaps, which are created for individul projects that are being followed up in the program. Roadmap, on the other hand, is split into milestones, i.e. targets/checkpoints where the project's progress is checked and measured. The milestones have a planned completion date, a forecasted completion date, if differnet than the plan, and a checkbox for when the milestone has been completed. Underneath the milestone, there are impacts. which cam be either financial or non-financial, recurring or one-time. Impacts have plan and forecast values as well.

Each program, stream, and roadmap has an owner/admin, who is responsible for keeping their respective part up-to-date. Program admin can access all the streams and roadmaps or the program, create new streams and roadmaps, and update or delte existing ones. Stream admin has the same rights, but for only individual streams. These admins can also export the data from the tool in CSV format. A roadmap owner can only access and update his/her roadmap(s). Admin and roadmap owner views are also slightly different due to the different needs of the user types: admin gets a management view, where the program is split into a treeview which allows them to drill down to different streams and roadmaps, and provides them with a table that shows the impact values of the particular program/stream they are looking at. A roadmap owner, on the other hand, gets a more simplistic view with a drop down menu with all their roadmaps.

As Workably is a business-first tool, you cannot sign up and start updating random company's roadmaps for fun. Instead, you have to apply for an account, or one will be assigned to you by an admin. In either case, the tool notifies admin/soon-to-be user via email about the account request/new account. For demo purposes, I've created multiple accounts with different access rights to the program to demontrate the different views:
- username: jujovi password: o4o525OO68 -> a program admin (with multiple programs)
- username: vivaman password: o4o525OO68 -> a stream admin (with multiple streams)
- username: pahemul password: o4o525OO68 -> a roadmap owner (with multiple roadmaps)
- username: superuser password: o4o525OO68 -> the only superuser to the tool

For the general structure of the Workably web app, I adopted the ideas from the network pset, i.e. I used a a singe-page application architecture, and used APIs to query the Django backend. The relative complexity of the app meant that both the views.py and workably.js files are quite long, but hopefully quite well documented. The SPA approach meant that there are not many HTML templates.

#### Features
1. Projects are created by a superuser in the admin view,
2. Other users can view, create, update, and delete streams, programs, milestones, and impacts depending on their user rights,
3. Users can update project's/roadmap's basic information and assign a new owner for it,
4. Program and stream admins can export data as csv files on different levels of the program,
5. Users have their own admin/profile pages where they can update their personal information and change their password,
6. If user has forgotten their password, it can also be changed via email.

#### Justification
Why this project is distinct from all the previous ones then? Workably has
- more and more complex APIs in the backend from which all the data is manipulated and saved,
- more models and more complex relations between them than in the previous projects:
  - not only one type of data (messages, emails or likes) to render on the page, but a nested structure (program - stream - roadmap),
  - relation withim a model (stream-substream),
  - different user roles for differnet views of the webpage,
- JavaScript used to create more complex webpages and elements than in the coursework (e.g. treeview, datatable, milestones with impacts),
- ability to export data from the website in a csv format to use in Excel and PowerPoint,
- a personal admin/profile view, where user can change their own information and password,
- send password reset link using email, 
- instead of signing up for an account, the user can request for an account which then sends an email to the admin,
- similarly, when an account is created for a new user, the new user is sent an email containing their username and asked to contact an admin for a password.

#### Files and Directories
- `Main Directory`
  - `workably`: the main application directory
    - `static/workably`: has all the static files
      - `styles.css`: all the styling for the website
      - `workably.js`: contains all the JavaScript for fetching data and manipulating the DOM (more details underneath)
    - `templates/workably`: has all the HTML files for the app (including the ones needed for the password reset via email functionality),
    - `models.py`: contains all nine models needed to make the application's structure work, and includes an imported field - CountryFiled,
    - `urls.py`: includes all the 'regular' URLs for logging in and out, as well as all the API paths, and the paths for resetting the password via email,
    - `views.py`: has all the view functions needed to make the app work, including the APIs which are used to create, update, and delete data,
  
##### Models.py
In the models.py file, I created nine different models to reflect the structure of the program. On the side of the regular, though slightly modified User model, I added Role and Profile models, which contain the different types of User roles (program/stream admin, roadmap owner) and other personal information for the user, respectively. After those, I needed models for Program, Stream, Roadmap, Milestone, ImpactType, and Impact to create the structure described above. For the Roadmap model, I had to import CountryField to provide information often needed for internal reporting.

##### Workably.js
Workably.js is a sprawling file with over 1,500 rows which create the SPA architecture with the layout.html & index.html files. First, the initial view for the user is displayed and it depends on whether the user is an admin or a roadmap owner. Load_roadmap function loads an individual roadmap by getting first the roadmap's information, and then proceeds to load the milestones and the impacts and displays them in the roadmap-view div. Edit_roadmap and Post_edits functions allow the editing of the roadmap's basic information and saving the edits, respectively. Add_miletone, Save_milestone, del_milestone, add_impact, del_impact, and save_changes allow the user to add/delete/save impacts and milestones and save changes in the roadmaps. View_profile, Save_profile, password_view, save_password functions allow the user to view their own profile information, make and save changes to them, and update their password. Load_treeview loads the treeview of an individual program/stream(s) and therefore allows the drill down to the roadmap level. The treeview is only visible for the admins in the Management view. Load_impacttable loads the impacts of a program/stream and presents them in a table form, after the program/stream has been chosen in the treeview. Create_stream, Save_stream, Delete_stream, Create_roadmap, Save_roadmap, and Delete_roadmap allow the creation/saving/deleting of new streams/substreams/roadmaps for admins. Finally, the Export_data and its helper function downloadBlob allow the exporting and downloading of program, and stream-level imapact data in csv format.

##### Views.py
Like in the Network project, the Views.py contains the backend APIs for the Workably app (urls are in the urls.py file, of course). Many of the responses are dependant on the user's rights. Get_roadmps returns the roadmaps that the user has the rights to and is used to fill up the dropdown menu in the Roadmap owner view as well as the Profile view. Get_programs returns programs, if user is a program admin and streams, if user is a stream admin. It is used in Managment view to get the dropdown values/headline above the treeview and in the Profile view. Get_streams returns a json of streams, where the user is the named admin. Used in the Profile view. Post_stream is used to create or delete streams by admins in the Management view. The list_streams function is used to get all the streams within a certain program where the user is the admin. Used in the Management view, in the load_treeview function. List_roadmaps lists the roadmaps within the aforementioned streams. The simplistic Roadmap is used to get all the information of the roamdap to the load_roadmap function. Edit_roadmap posts edits to a roadmap or deletes one. Post_roadmap is used to create a new roadmap. The Milestones function gets all the milestones of the specified roadmap, whereas Milestone adds/edits/deletes a milestone. Impacts function creates the impact table for the Management view and it returns a json with all the plan, forecast, and actual impact values of the specified program/stream while also taking into account the user's access rights. Get_impacts is used to get individual milestone's impacts in the Roadmap view. The post_impacts function either adds a new impact, or edits or deletes an existing one. Impact_types returns a list of the impact types specified in the model. User, profiles, and profile get user and profile information for various views and dropdowns. Edit_profile allows the user to update their personal information in the Profile view. Regions and country_list fill up dropdowns from which to select region and country infromation for an individual roamdap. Export loops through the specified milestones to create the csv file which is then passed back to the front end and downloaded to the user's computer. Index function does nothing but renders the index.html file and the functions underneath that are boilerplate Django functions to log in and out, registering users and changing passwords with slight modifications for this projects needs.

##### Templates
The templates folder doesn't contain many html files, and most of them are pretty familiar from the course's psets. The only completely new ones are the password_reset_complete, password_reset_confirm, password_reset_done, and password_reset templates which are needed to send an email to the user when they have forgotten their password.
