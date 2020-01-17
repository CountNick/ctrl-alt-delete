# Ethnic profiling in Amsterdam

# General information

* [Controle Alt Delete](https://controlealtdelete.nl/) Gave us the opportunity to make a data visualisation about a survey they did on ethnic profiling in Amsterdam.

### Full documentation

* [Click here]() to see our product biography
* [Click here]() to see our design rationale

## Screenshots

### Landing page
![1](https://user-images.githubusercontent.com/45566396/72608412-e4e36300-3922-11ea-803e-f77c802f0690.png)

### Theme screens
![2](https://user-images.githubusercontent.com/45566396/72608582-4572a000-3923-11ea-8c09-6d9de5056ae3.png)

### Description

This project shows datavisualisations based on some questions that were asked to respondents that live in Amsterdam about the police. We have devided the respondents into 3 groups:
* People who are dutch (without any migration background)
* People with a non-Western migration background
* People with a Western migration background

We focus on the average trust grades in the police on a scale from 1-10 per group. You can explore through multiple datavisualisations about these groups to see why the grades are established like this. You will be able to see what kinds of things has lots of impact on the trust in the police.

## Features

* Pie chart rendered with d3
* Stacked bar chart rendered with d3 with interaction (in tooltip on hover)
* Motion design gifs
* Grouped bar chart rendered with d3 with interaction (when filtering between groups)

## Data we used

The survey consisted of 20 questions, some of them about the personal background of the person and most of the questions about the police. People were approached on the street who live in Amsterdam to fill in the survey.

We received the data we needed from the respondents from Controle Alt Delete in an Excel sheet. We made this into a tsv so we could change this into JSON with d3.

## Data cleaning and transforming

To be able to use the data in d3, we needed to clean and tranform the data. This includes:
* Deleting records we can't use
* Deviding the data into the 3 groups we mentioned earlier
* Deviding this data into 2 groups (contact or no contact with police in the last 12 months)
* Calculating percentages and averages
* Creating objects with transformed data

## d3

* Example used for Pie chart:
[Pie chart](https://observablehq.com/@d3/pie-chart)

* Examples used for Stacked Bar chart and Grouped Bar chart:
[Stacked Bar chart](https://observablehq.com/@d3/stacked-bar-chart)
[Normalized Stacked Bar chart](https://observablehq.com/@d3/stacked-normalized-horizontal-bar)


## Project structure

![project-structure](https://user-images.githubusercontent.com/45566396/72612976-98058980-392e-11ea-8267-c5e6b050d0ed.png)

We have devided our project in multiple folders, these ones are:
* Modules - to create files to keep structure and overview in our project
* Public - this containes the fonts, images and css

In **index.js** we import all our modules.

We also use ESLint so we use the same rules and consitency for our code. This makes it easier to find bugs and makes it easier to work together on the project since we use the same coding style.

#### Our ESLint rules are:

![image](https://user-images.githubusercontent.com/45566396/72613363-97212780-392f-11ea-838d-c76eaa51f943.png)

For further information what these rules do, please take a look at our [product biography]() where this is further explained under the paragraph **"Coding standards"**.


## Installation

### 1. Clone this repository to your computer
Run this command in your terminal:

`git clone https://github.com/StefanGerrits2/ctrl-alt-delete`
### 2. Navigate into the root of the folder
Run this command in your terminal:

`cd ctrl-alt-delete`

### 3. Viewing the website
Open the `index.html` file in a browser.

>
> ###### NOTE:
> You can't just open your `index.html` file because I use es6 modoules. You need to start a live server to make it work. For example, I use the plugin `Preview on Web Server`.

## Sources

* [MDN](https://developer.mozilla.org/nl/) - Main source for javascript code.
* [d3](https://d3js.org/) - To use examples for d3
* [Controle Alt Delete](https://controlealtdelete.nl/) - For general information and inspiration
* [Andy Kirk - Data Visualisation](https://www.bol.com/nl/f/data-visualisation/9200000037335441/) - To understand and use how you can create good data visualisations

## Check it out!

* [Click here to open the live link](https://stefangerrits2.github.io/ctrl-alt-delete/)

## License

[MIT](https://github.com/StefanGerrits2/ctrl-alt-delete/blob/master/LICENSE.txt) © Nick Meijer, Nikita van Leeuwen and Stefan Gerrits