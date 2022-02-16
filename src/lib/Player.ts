import * as HTTP from './APIRequest';
import { URL } from 'node:url';
import { Team } from './Team';

export class Player {
  constructor(playerData: string | number | any) {
    if (typeof playerData == 'string') {
      let data = JSON.parse(playerData);
      this.Id = data.id;
      this.UserId = data.user_id;
      this.RegisteredDate = new Date(data.registered_at.date);
      this.RegisteredDateHuman = data.registered_at_human;
      this.TeamRegisteredDate = null;
      this.TeamRegisteredDateHuman = null;
      this.Name = data.display_name;
      this.Status = data.player_status;
      this.IsBanned = data.is_banned;
      this.BanReason = data.ban_reason;
      this.IsHidden = data.is_hidden == 0 ? false : true;
      this.CountryCode = data.country_code;
      this.CountryName = data.country_name;
      this.Region = data.region;
      this.City = data.city;
      this.DiscordPrivacy = data.discord_privacy;
      this.DiscordTag = data.discord_tag;
      this.SwitchFC = data.switch_fc;
      this.NNID = data.nnid;
      this.FC3DS = data.fc_3ds;
      this.MKTourFC = data.mktour_fc;
      this.ProfilePicture = data.profile_picture;
      this.ProfilePictureBorderColor = data.profile_picture_border_color;
      this.ProfileMessage = data.profile_message;
      this.IsSupporter = data.is_supporter;
      this.IsAdministrator = data.is_administrator;
      this.IsModerator = data.is_moderator;
      this.IsGlobalEventAdmin = data.is_global_event_admin;
      this.IsGlobalEventMod = data.is_global_event_mod;
      this.IsEventAdmin = data.is_event_admin;
      this.IsEventMod = data.is_event_mod;
      this.CurrentTeams = [];
      for (let team of data.current_teams) {
        this.CurrentTeams.push(new Player.CurrentTeam(team));
      }
    } else {
      this.Id = playerData.player_id;
      this.UserId = playerData.user_id;
      this.RegisteredDate = new Date(playerData.registered_at);
      this.RegisteredDateHuman = playerData.registered_at_human;
      this.TeamRegisteredDate = !playerData.team_registered_at ? null : new Date(playerData.team_registered_at);
      this.TeamRegisteredDateHuman = !playerData.team_registered_at_human ? null : playerData.team_registered_at_human;
      this.Name = playerData.display_name;
      this.Status = playerData.player_status;
      this.CountryCode = playerData.country_code;
      this.CountryName = playerData.country_name;
      this.SwitchFC = playerData.switch_fc;
      this.NNID = playerData.nnid;
      this.FC3DS = playerData.fc_3ds;
      this.MKTourFC = playerData.mktour_fc;
    }
  }

  /**
   * Registry id for the corresponding player
   */
  public Id: number;
  /**
   * Forum id for the corresponding player
   */
  public UserId: number;
  /**
   * The date on which the user has registered in the mkc registry
   */
  public RegisteredDate: Date;
  /**
   * A human-readable string for the registration date
   */
  public RegisteredDateHuman: string;
  /**
   * The date on which the user joined their team
   *
   * Only available with category filter in Players collection
   */
  public TeamRegisteredDate: Date | null;
  /**
   * A human-readable string for the team joining date
   *
   * Only available with category filter in Players collection
   */
  public TeamRegisteredDateHuman: string | null;
  /**
   * The users name in the registry
   */
  public Name: string;
  public Status: string | null;
  public IsBanned?: boolean | null;
  public BanReason?: string | null;
  public IsHidden?: boolean | null;
  public CountryCode: string;
  public CountryName: string;
  public Region?: string | null;
  public City?: string | null;
  public DiscordPrivacy?: string | null;
  public DiscordTag?: string | null;
  public SwitchFC: string | null;
  public NNID: string | null;
  public FC3DS: string | null;
  public MKTourFC: string | null;
  public ProfilePicture?: string | null;
  public ProfilePictureBorderColor?: number;
  public ProfileMessage?: string;
  public IsSupporter?: boolean;
  public IsAdministrator?: boolean;
  public IsModerator?: boolean;
  public IsGlobalEventAdmin?: boolean;
  public IsGlobalEventMod?: boolean;
  public IsEventAdmin?: boolean;
  public IsEventMod?: boolean;

  /**
   * Only available with category filter in Players collection
   */
  public CurrentTeam?: Player.CurrentTeam;
  /**
   * Only available when directly loading the player
   */
  public CurrentTeams?: Player.CurrentTeam[];

  public async Load(): Promise<void> {
    let player = await Player.Get(this.Id);
    this.Id = player.Id;
    this.UserId = player.UserId;
    this.RegisteredDate = player.RegisteredDate;
    this.RegisteredDateHuman = player.RegisteredDateHuman;
    this.TeamRegisteredDate = null;
    this.TeamRegisteredDateHuman = null;
    this.Name = player.Name;
    this.Status = player.Status;
    this.IsBanned = player.IsBanned;
    this.BanReason = player.BanReason;
    this.IsHidden = player.IsHidden;
    this.CountryCode = player.CountryCode;
    this.CountryName = player.CountryName;
    this.Region = player.Region;
    this.City = player.City;
    this.DiscordPrivacy = player.DiscordPrivacy;
    this.DiscordTag = player.DiscordTag;
    this.SwitchFC = player.SwitchFC;
    this.NNID = player.NNID;
    this.FC3DS = player.FC3DS;
    this.MKTourFC = player.MKTourFC;
    this.ProfilePicture = player.ProfilePicture;
    this.ProfilePictureBorderColor = player.ProfilePictureBorderColor;
    this.ProfileMessage = player.ProfileMessage;
    this.IsSupporter = player.IsSupporter;
    this.IsAdministrator = player.IsAdministrator;
    this.IsModerator = player.IsModerator;
    this.IsGlobalEventAdmin = player.IsGlobalEventAdmin;
    this.IsGlobalEventMod = player.IsGlobalEventMod;
    this.IsEventAdmin = player.IsEventAdmin;
    this.IsEventMod = player.IsEventMod;
    this.CurrentTeams = player.CurrentTeams;
  }

  /**
   * Sends a request to the API asynchronously with the given parameters and returns the result as a new Team object
   * @param {number} teamId
   *
   * Examples:
   * ```js
   * let result = await Team.Get(10);
   * ```
   */
  public static async Get(playerId: number): Promise<Player> {
    let uri: URL = new URL(`https://www.mariokartcentral.com/mkc/api/registry/players/${playerId}`);
    return new Player(await HTTP.get(uri));
  }
}

export namespace Player {
  export class CurrentTeam {
    constructor(teamData: any) {
      this.Mode = teamData.mode;
      this.ModeTitle = teamData.mode_title;
      this.ModeKey = teamData.mode_key;
      this.TeamId = teamData.team_id;
      this.TeamName = teamData.team_name;
      this.TeamTag = teamData.team_tag;
      this.TeamStatus = teamData.team_status;
    }

    public Mode?: string;
    public ModeTitle?: string;
    public ModeKey?: string;
    public TeamId: number;
    public TeamName: string;
    public TeamTag: string;
    public TeamStatus: string;
    public TeamColor?: number;

    public async GetTeam(): Promise<Team> {
      return await Team.Get(this.TeamId);
    }
  }
}
