# Parking Reservation system

## Context
You are the software development team in charge of the internal apps of the company (usually called Business Support or IT for IT).

Since the pandemic and the onset of hybrid work, parking management has become chaotic.

Before, it was not fair but relatively simple: older internal employees of the company got their parking lot after years, one by one, when someone left. Management had their spots reserved even if they didn't use them, and a very few spots were available for daily random use.

Since the pandemic, only a few places are blocked for managers, and all the rest is available on demand via half-day reservation slots for everyone. Currently, this is managed by a mail people need to send every week to the management secretaries. They then mark the reservation on a shared Excel file and return a response with the confirmation of days reserved during the week by the person and their attributed parking lot. This is a lot of work for them and a little messy by the end.


## Your mission
Your work is to create a real replacement app for this parking reservation process.
This application is intended to be used by non-technical people, so, it has to be simple, practical and adapted to their specific needs. Users need to be authenticated and views adapted to their profile.

_This could be any type of app, but probably a web app should be the best compromise (please argument your choices)_

## Facts and information about the project

### Physical facts

About the parking lots:
- Consider that all the lots are the same size and large enough for any car
- There are 60 places available in total, all numbered
- It is organized as 6 rows of 10 lots, each row is labeled with a letter from A to F. Rows A and F are the ones at the borders of the parking with a wall behind and B, C, D and E are central rows grouped by pairs `[A  B|C  D|E  F]`
- The Identifier for each place is the row letter + a number from [01] to [10], which means the first place when you enter is **A01** and the last one is **F10**
- The wall rows A and F are reserved to electric or hybrid vehicles as each place has an associated electric wall charger. Electricity is free of charge for the employee, costs are covered by the company

Here is a plan of our Parking 
![parking map v1 2 250525](https://gist.github.com/user-attachments/assets/b0638140-b4bd-4878-ba11-02a791a7c034)
 

### Constraints and reservation rules

- A reservation can be made for a maximum of 5 working days (I can't book a place for the whole month) and can start on the current day if there is any space available.
- If someone needs to charge, they must ask for a place in rows A or F with electric plugs.
- An employee should do a check-in when they park the car to confirm that the space has been occupied as planned.
- A QR code with the space number and pointing to a dedicated end-point in your app will be printed at each parking lot.
- If a reserved space doesn't receive a check-in confirmation by 11 AM, it is marked as available and can be reserved by someone else on the same day.
- Employees should be completely autonomous in making their reservations with this app, but secretaries will still be in charge of support and need full admin access to the back office of your application to manually edit whatever is necessary.
- Your app should not only have the current and future reservations but should also keep track of the entire history of the reservations.
- Apart from the Employee profile (what an employee sees when they open the application) and the secretary profile (see everything with editing capabilities, including adding new users and managing them), there should also be a management profile: Managers need to see a dashboard to know how many people are using the parking, how full it is on average, what the proportion is of people making a reservation who don't use it, and the proportion of spaces with electric chargers.
- Managers could also reserve their parking through the app but they are are authorized to book the place for one full month duration (30 days) 
- When someone makes a reservation, a message to a queue should be sent in order to be processed by another application that will send a confirmation e-mail. 

## Deliverables

Your product owner (ME) is available at any moment to discuss about the rules, constraints or any question about requirements or the desired app. Don't hesitate to clarify something.  

You'll work in 4 sprints of half day, which means that it is expected you deliver something valuable at the end of each sprint:
- **iteration 1** : Repository created, architecture decisions (ADRs) and application diagrams (C4, ex of C4 here : https://drive.google.com/file/d/1AGVDm9D6bTnCsG2X4VLF94q6XbqQKEjB/view?pli=1) in docs folder
- **iteration 2** : a walking skeleton is committed and can be shown.
- **iteration 3** : a prototype with some prioritized functionalities is available
- **iteration 4** : more prioritized functionalities, this version, even incomplete must be deployable and usable. User documentation must be present.

create a git tag for each iteration deliverable

## Ways of working

You must work in groups, either in mob or in parallel. It is **mandatory that everyone commits code and contributes** (we'll look at the Git history).

You can also use AI intelligently, mostly to simplify the creation of boilerplate code. You always need to be in charge of your technical choices, architecture, and design. Remember that this course is about **software design**; you'll be evaluated on your architecture and design, not on the number of lines of code you or AI write. Don't forget that now AI "is the new normal", you need to ensure that context, instructions and ways to work are shared among the team and that future team should be able to develop in the exact same conditions as you now. 

It is expected that your app runs in containers, not only to simplify testing and deployment but also to facilitate easier contributions.

It is also expected that your app has tests... Real tests that actually mean something. Please do not create a test project with an assert(true).isTrue() inside just to say you have tests...

Script everything! Every repeatable action should be scripted : build.sh, run.sh, test.sh,...i don't need to know some fancy commands and follow a complicated process, these should be masked within simple scripts to run!


## Have fun!