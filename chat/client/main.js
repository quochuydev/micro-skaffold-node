const app = new Vue({
  el: "#app",
  data: {
    title: "Chat",
    // host: "http://app.local",
    host: "https://chat.cafe2hdaily.xyz",
    // host: "http://localhost:4000",
    username: "admin",
    password: "admin",
    token: "",
    partnerId: null,
    user: null,
    rooms: [],
    selectedRoomId: null,
    text: "test",
    messages: [],
    socket: null,
    http: null,
    typing: false,
    users: [],
  },

  async beforeMount() {
    const { data } = await axios.create({}).get(this.host + "/api/users");
    console.log(data);
    this.users = data;
  },

  methods: {
    async login() {
      const { data } = await axios.create({}).post(this.host + "/api/signin", {
        username: this.username,
        password: this.password,
      });
      console.log(data);
      this.token = data.token;
      this.join();
    },

    async join() {
      this.http = axios.create({
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });

      const { data } = await this.http.get(this.host + "/api/user");
      this.user = data;

      this.initSocket();
      this.getRooms();
    },

    async getRooms() {
      const { data } = await this.http.get(this.host + "/api/rooms");
      console.log(data);
      this.rooms = data;
    },

    async createRoom() {
      if (!this.partnerId) {
        return;
      }

      const { data } = await this.http.post(this.host + "/api/rooms", {
        partnerId: this.partnerId,
      });
      console.log(data);
      this.getRooms();
    },

    async joinRoom(id) {
      console.log("roomId", id);

      this.selectedRoomId = id;

      await this.getMessages();

      this.socket.emit("channel.join", { id: this.selectedRoomId });
    },

    async getMessages() {
      const { data } = await this.http.get(
        `${this.host}/api/rooms/${this.selectedRoomId}/messages`
      );
      console.log(data);
      this.messages = data;
    },

    sendMessage() {
      if (this.validateInput()) {
        const message = {
          content: this.text,
          id: this.selectedRoomId,
        };
        this.socket.emit("channel.message", message);
        this.text = "";
        this.getMessages();
      }
    },

    validateInput() {
      return this.text.trim().length > 0;
    },

    async initSocket() {
      this.socket = io(this.host, {
        path: "/socket",
        reconnect: true,
        secure: true,
        transports: ["websocket", "polling"],
        query: { token: this.token },
      });

      this.socket.on("notification", (data) => {
        console.log("notification", data);
      });

      this.socket.on("channel.message", async (data) => {
        console.log("channel.message", data);
        await this.getMessages();
      });

      this.socket.on("channel.list.reload", async () => {
        console.log("channel.list.reload");
        await this.getMessages();
      });

      this.socket.on("channel.typing.processing", () => {
        console.log("channel.typing.processing", this.socket.typing);
      });

      this.socket.on("channel.typing.stop", (data) => {
        console.log("channel.typing.stop", data);
      });

      this.socket.on("channel.seen", (seen) => {
        console.log("channel.seen", seen);
      });
    },

    formatMessage(message) {
      const name = message.creator.firstName || message.creatorId;
      return {
        content: message.content,
        createdAt: message.createdAt,
        name,
      };
    },

    handleChange() {
      this.socket.emit("channel.typing.start");

      setTimeout(() => {
        this.socket.emit("channel.typing.stop");
      }, 5000);
    },

    handleSeen() {
      console.log("seen");
      this.socket.emit("channel.seen");
    },
  },
});

function timeout(time) {
  return new Promise((resolve) => setTimeout(resolve, time));
}
