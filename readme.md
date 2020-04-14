# Budgeteer

Budgeteer is a simple low-complexity budget app for those people who are concerned with really only one aspect of a budget: making sure bills get paid and you're not left broke.
With this "bill first" mindset, this is aimed at the niche group of people who have monthly bills, but are paid every two weeks.
This is actually quite a lot of people. So, why Budgeteer? Let me break down the problem this app solves:

## The Problem

- Monthly bills = 12 bill/year
- Paid every two weeks = 52 paychecks/year

If you're like me and live off of two paychecks to cover monthly expenses, this represents a conundrum.
- 52/2 = 26
- 26/2 = 13
- 13, not 12.

So, I get paid for 13 "months", but have 12 months of bills. How do I decide what bills get paid with which paychecks? Enter Budgeteer.

## The Solution

The solution that Budgeteer gives is this: you define the monthly bills and when you get paid, assign bills to paychecks. That's it. Simple, low-complexity solution.
Currently, I'm hosting the app on some personal shared hosting. But here's the source code. If you like it, you can use it! When a new user registers, I get notified and I'll reach out to you to provide some first steps like docs (pre-documentation, if you will).

## Entered Testing Phase!

Yay! I've deployed the app at [here](https://www.budgeteer.ironmthome.com) and public registration is open. However, to be able to login in after registration you'll need to be verified. So after registration, I get a notification, I'll verify your account and provide some basic guidelines for using the app. As I have no documentation on how to use the app (yet) or real testing data, if you have ideas or just general feedback shoot me an email. If you'd like to rip me a new one anonymously, I'll be throwing up a feedback form, which won't include an idetifier leading back to you. Or submit an issue here on GitHub. Anyways, hope those who use it find it helpful and can give me any kind of feedback. Cheers!
-AE

## Roadmap

 * 4/13/20 - added sorting in monthly bills and paychecks automatically (by paid on in paychecks and day due on in bills)
 * (Sometime in the future?) - adding functionality to split bills across paychecks within an individual month

## License

Budgeteer is open-source software licensed under the [MIT license](https://opensource.org/licenses/MIT).
