const app = new Vue({
  el: "#app",
  data: {
    title: "Chat",
    token: "token",
    user: null,
    rooms: [],
    selectedRoomId: null,
    text: "test",
    messages: [],
    socket: null,
    http: null,
    typing: false,
  },
  beforeMount() {
    this.initSocket();
  },
  methods: {
    async login() {},
    async getRooms() {
      this.rooms = [];
    },

    async joinRoom(id) {
      console.log("roomId", id);

      this.selectedRoomId = id;

      this.socket.emit("channel.join", { id: this.selectedRoomId });

      await this.getMessages();
    },

    async getMessages() {
      this.messages = [];
    },

    sendMessage() {
      if (this.validateInput()) {
        const message = {
          content: this.text,
          id: this.selectedRoomId,
        };
        this.socket.emit("channel.message", message);
        this.text = "";
      }
    },

    validateInput() {
      return this.text.trim().length > 0;
    },
    async initSocket() {
      this.socket = io("http://app.local", {
        path: "/socket",
        reconnect: true,
        secure: true,
        transports: ["websocket", "polling"],
        query: { token: this.token },
      });

      this.joinRoom("roomId");

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
        this.typing = true;

        setTimeout(() => {
          this.socket.emit("channel.typing.stop");
        }, 1000);
      });

      this.socket.on("channel.typing.stop", () => {
        console.log("channel.typing.stop");
        this.typing = false;
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
      console.log("change", this.text, this.selectedRoomId);
      this.socket.emit("channel.typing.start");
      // this.socket.emit("channel.delete", { id: this.selectedRoomId });
    },
    handleSeen() {
      console.log("seen");
      this.socket.emit("channel.seen");
    },
  },
});
