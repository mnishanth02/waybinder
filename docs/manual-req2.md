# Waybinder Functionality  Document

## Roles

- Anonymous User:

    - Can navigate throgh the waybinder platfomr, search for any Journey in any particular location, year, month, season, with athlete
    - can search For any athletes who hav registerd in the platform and view their Journey and profile.
    - can view the eloborate details of any trip that user wants to view including, planing, trip details, maps and other details
    - Canot edit or download any resource from the platform,

- Logged in User:

    - All the access of Anonymous User
    - Can comment on any trip details,
    - Can download any resource from the platform,
    - can bookmark any trip
    - Follow any athlete
    - will have an option to register himself as an Athelte

- Athlete:

    - All the access of Logged in User
    - Can create/edit/delete a trip
    - Can view the trip details of any trip created by any other athlete
    - can checklist for the trip and manage the same and can be shred with others



## Waybinder workflow ovrview for Athlete:

- By default, whoever logs in, they will be a normal logged in user If they want to register themselves as an athlete, we should have an option after they login to register for an athlete.
- Now user will be navigated to the athlete on-boarding screen. And we will collect. The athlete related information, basic details Their sports details their sports history nd other details whihc is required for the platform
- Once they have registered as an athlete, they will be having an option to create A journey.
- A During a journey creation, we can ask certain details like A title, some description, start and end date What is the type of journey
- A journey or a trip could be of any type. They can go for trekking Travis Running mountainering travel cycling. Or a normal Casual travel plan
- During the journey creation, we have two types. We can add two types of user. Buddy and group member.
  - Difference between buddy and group members like When I add my friend as a buddy, the same journey will be shared in his Profile as well. He will not be able to create a duplicate entry of the same Event or a journey.
  - But if I add him or her as a group member then it means they are part of this journey Thats They can write their own blog, or they can write their own trip in their profile
  - The athlete who have created the journey and the buddy, will have the same control, same access, same level of Abstraction So anyone can create, update anything for the particular journey
- Once a basic journey Is created in the platform? Now comes the next Planning related Activities
  - In the planning Face we can Add a checklist. Permit Things that we need to bring for the trip, travel details and contact, To do items, And couple of other things As part of the planning phase.
- The journey can be updated any point in time, either in the past or Present or in the future We just need to make sure we are selecting the journey start and end date properly
- Now the journey is created, right? Within the journey, we will be having an option to add N number of activities These activities can be mapped between any days. Within the start and end date of the journey.
- The platform should automatically group those activities based on the day it is mapped to, and display those details in an intuitive way for readability and accessbility.
- When we add an individual activity, we will be having an option Upload any documents any plan gpx file photos videos or emerge any of the Instagram or Facebook photos or embered youtube videos. Within Individual activity.
- We should be having an option to Write a blogging style editor. For that particular activity.
- When we add any gpx file for a particular activity We should be having an option to Edit the GPX details
- Like this. Let's say the athletes have added all the activities for all the days in the journey. Data entry phase is completed.
- Once our entire journey details are added, by default, all the journeys are private. When once everything is ready, we can change that to public, and we can share it with the others.
- We should be having an option to share. The journey in an intuitive way to any platform, like Instagram, Facebook Twitter Or even we should allow the user to embed this journey details within their own website or within their own blogging platform
- Sometimes the athletes might need to merge more than one GPX file So we should be having an option to merge multiple GPX files into one GPX file. and update the ame in any of the activity. we can provide this option in the individual activity creation page /screen.



## Public User Functionality,

- As a user. When I click on any of the shared journey from the platform, I should be directly redirected to Trip page Within the platform
- First, I should be able to see Trip details And who Join the And high level overview of the entire trip. Those kind of stuff
- We should come up with an idea how we can display this multi day activity in the user screen. Instead of Justice a blogging style One option is we can display it as a timeline view. In an intuitive way or we should display it in such a way. They should be able to see the overall picture of the journey And if they want, they can, they can dig deeper into the individual activity.
- One important thing we are trying to solve as part of this platform is how we are viewing the multi day event. Instead of justice, like a normal blogging style We should be Displaying that in a different way For the user So that they can easily navigate and find what they are looking for.
- If the user is logged into the platform and they are trying to search something, and they don't know how to search or where to search, we should have an option to Search with AI, right? So they can ask anything or search anything in a human readable language. We should give a proper result integrated with the ai.


- In all Cases of anonymous user logged in user logged in as an athlete. The entire Application navigation and Analytics need to be captured properly. So that is very important for the dashboard details
