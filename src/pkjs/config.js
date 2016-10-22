module.exports = [
	{
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "User Interface Configuration"
      },
      {
        "type": "toggle",
        "messageKey": "WhiteOnBlack",
        "label": "Black Background",
        "defaultValue": true
      },
			{
        "type": "toggle",
        "messageKey": "ThisWeekSection",
        "label": "Include This Week Section?",
        "defaultValue": true
      },
			{
        "type": "toggle",
        "messageKey": "SeasonSection",
        "label": "Include Season Section?",
        "defaultValue": true
      }
    ]
  },
  {
    "type": "heading",
    "defaultValue": "MFL Configuration"
  },
  {
    "type": "text",
    "defaultValue": "Please enter your league number and your franchise id in that league"
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "League 1"
      },
      {
        "type": "input",
        "messageKey": "LeagueOneNumber",
        "label": "League #",
				"attributes": {
					"placeholder": "11902"
				}
      },
      {
        "type": "input",
        "messageKey": "LeagueOneFranchiseNumber",
        "label": "Franchise Id",
				"attributes": {
					"placeholder": "0008"
				}
      }
    ]
  },
  {
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "League 2"
      },
      {
        "type": "input",
        "messageKey": "LeagueTwoNumber",
        "label": "League #",
				"attributes": {
					"placeholder": "11902"
				}
      },
      {
        "type": "input",
        "messageKey": "LeagueTwoFranchiseNumber",
        "label": "Franchise Id",
				"attributes": {
					"placeholder": "0008"
				}
      }
    ]
  },
	{
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "League 3"
      },
      {
        "type": "input",
        "messageKey": "LeagueThreeNumber",
        "label": "League #",
				"attributes": {
					"placeholder": "11902"
				}
      },
      {
        "type": "input",
        "messageKey": "LeagueThreeFranchiseNumber",
        "label": "Franchise Id",
				"attributes": {
					"placeholder": "0008"
				}
      }
    ]
  },
	{
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "League 4"
      },
      {
        "type": "input",
        "messageKey": "LeagueFourNumber",
        "label": "League #",
				"attributes": {
					"placeholder": "11902"
				}
      },
      {
        "type": "input",
        "messageKey": "LeagueFourFranchiseNumber",
        "label": "Franchise Id",
				"attributes": {
					"placeholder": "0008"
				}
      }
    ]
  },
	{
    "type": "section",
    "items": [
      {
        "type": "heading",
        "defaultValue": "League 5"
      },
      {
        "type": "input",
        "messageKey": "LeagueFiveNumber",
        "label": "League #",
				"attributes": {
					"placeholder": "11902"
				}
      },
      {
        "type": "input",
        "messageKey": "LeagueFiveFranchiseNumber",
        "label": "Franchise Id",
				"attributes": {
					"placeholder": "0008"
				}
      }
    ]
  },
  {
    "type": "submit",
    "defaultValue": "Save Settings"
  }
];