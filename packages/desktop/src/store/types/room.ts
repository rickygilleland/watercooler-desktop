enum RoomType {
  Room = "Room",
  Call = "Call",
}

export interface Room {
  id: number;
  team_id: number;
  organization_id: number;
  slug: string;
  type?: RoomType;
  is_private: boolean;
  video_enabled: boolean;
  channel_id: string;
  secret: string;
  pin: string;
  is_active: boolean;
  server_id: number;
}
