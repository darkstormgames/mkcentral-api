import * as HTTP from './APIRequest';
import { URL } from 'node:url';
import { Player } from './Player';

export class Team {
  constructor(teamData: string | any) {
    if (typeof teamData == 'string') {
      let data = JSON.parse(teamData);
      this.Id = data.id;
      this.Category = data.team_category;
      this.Description = data.team_description;
      this.MainLanguage = data.main_language;
      this.Name = data.team_name;
      this.Tag = data.team_tag;
      this.Color = data.team_color;
      this.Status = data.team_status;
      this.RecruitmentStatus = data.recruitment_status;
      this.IsHistorical = data.is_historical == 1 ? true : false;
      this.IsShadow = false;
      this.PlayerCount = 0; // build some logic to get all members of all rosters without duplicates
      this.FoundingDate = new Date(data.founding_date.date);
      this.FoundingDateHuman = data.founding_date_human;
      this.Logo = new URL(`https://www.mariokartcentral.com/mkc/storage/${data.team_logo}`);
      this.PrimaryTeamId = data.primary_team_id;
      this.PrimaryTeamName = data.primary_team_name;
      this.Rosters = new Team.Rosters(data.rosters);
      this.SecondaryTeams = [];
      for (let team of data.secondary_teams) {
        this.SecondaryTeams.push({
          Id: team.id,
          Name: team.name,
        });
      }
    } else {
      this.Id = teamData.team_id;
      this.Name = teamData.team_name;
      this.Tag = teamData.team_tag;
      this.Color = teamData.team_color;
      this.Status = teamData.team_status;
      this.RecruitmentStatus = teamData.recruitment_status;
      this.IsHistorical = false;
      this.IsShadow = teamData.is_shadow == 1 ? true : false;
      this.PlayerCount = teamData.player_count;
      this.FoundingDate = new Date(teamData.founding_date);
      this.FoundingDateHuman = teamData.founding_date_human;
      this.SecondaryTeams = [];
    }
  }

  public Id: number;
  public Name: string;
  public Tag: string;
  public Color: number;
  public Status: string;
  public RecruitmentStatus: string;
  public IsShadow: boolean;
  public PlayerCount: number;
  public FoundingDate: Date;
  public FoundingDateHuman: string;

  public Category?: string;
  public Description?: string;
  public Logo?: URL;
  public IsHistorical: boolean;
  public MainLanguage?: string;
  public PrimaryTeamId?: number | null;
  public PrimaryTeamName?: string | null;
  public SecondaryTeams: {
    Id: number;
    Name: string;
  }[];
  public Rosters?: Team.Rosters;

  public async Load(): Promise<void> {
    let team = await Team.Get(this.Id);
    this.Id = team.Id;
    this.Category = team.Category;
    this.Description = team.Description;
    this.MainLanguage = team.MainLanguage;
    this.Name = team.Name;
    this.Tag = team.Tag;
    this.Color = team.Color;
    this.Status = team.Status;
    this.RecruitmentStatus = team.RecruitmentStatus;
    this.IsHistorical = team.IsHistorical;
    this.IsShadow = false;
    this.PlayerCount = 0; // build some logic to get all members of all rosters without duplicates
    this.FoundingDate = team.FoundingDate;
    this.FoundingDateHuman = team.FoundingDateHuman;
    this.Logo = team.Logo;
    this.PrimaryTeamId = team.PrimaryTeamId;
    this.PrimaryTeamName = team.PrimaryTeamName;
    this.Rosters = team.Rosters;
    this.SecondaryTeams = team.SecondaryTeams;
  }

  /**
   * Sends a request to the API asynchronously with the given parameters and returns the result as a new Team object
   * @param {number} teamId
   *
   * Examples:
   * ```js
   * let result = await Team.Get(1064);
   * ```
   */
  public static async Get(teamId: number): Promise<Team> {
    let uri: URL = new URL(`https://www.mariokartcentral.com/mkc/api/registry/teams/${teamId}`);
    return new Team(await HTTP.get(uri));
  }
}

export namespace Team {
  export class Rosters {
    constructor(rawData: any) {
      this['150cc'] = rawData['150cc'] ? new Roster(rawData['150cc']) : null;
      this['200cc'] = rawData['200cc'] ? new Roster(rawData['200cc']) : null;
      this['mktour_vs'] = rawData['mktour_vs'] ? new Roster(rawData['mktour_vs']) : null;
    }

    public '150cc': Roster | null;
    public '200cc': Roster | null;
    public 'mktour_vs': Roster | null;
  }

  export class Roster {
    constructor(rawData: any) {
      this.ModeKey = rawData.mode_key;
      this.ModeTitle = rawData.mode_title;
      this.RosterName = rawData.roster_name;
      this.IsUserMember = rawData.is_user_member;
      this.IsActive = rawData.active == 1 ? true : false;
      this.Members = [];
      for (let member of rawData.members) {
        this.Members.push(new Member(member));
      }
    }

    public ModeKey: string;
    public ModeTitle: string;
    public RosterName: string | null;
    public IsUserMember: boolean; // This is always false, because the bot is in no team
    public IsActive: boolean;
    public Members: Member[];
  }

  export class Member {
    constructor(rawData: any) {
      this.Id = rawData.player_id;
      this.Name = rawData.display_name;
      this.CustomFieldName = rawData.custom_field_name;
      this.CustomFieldValue = rawData.custom_field;
      this.Status = rawData.player_status;
      this.RegisteredDate = new Date(rawData.registered_since);
      this.RegisteredDateHuman = rawData.registered_since_human;
      this.CountryCode = rawData.country_code;
      this.CountryName = rawData.country_name;
      this.IsTeamLeader = rawData.team_leader == 1 ? true : false;
    }

    public Id: number;
    public Name: string;
    public CustomFieldName: string;
    public CustomFieldValue: string;
    public Status: string;
    public RegisteredDate: Date;
    public RegisteredDateHuman: string;
    public CountryCode: string;
    public CountryName: string;
    public IsTeamLeader: boolean;

    public async GetPlayer(): Promise<Player> {
      return await Player.Get(this.Id);
    }
  }
}
