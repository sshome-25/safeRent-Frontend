import NavBar from "@/components/NavBar.vue";

export default {
  name: "LandingPage",
  components: {
    NavBar,
  },
  methods: {
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
    },
  },
};
