export default {
  name: 'LandingPage',
  methods: {
    navigateTo(routeName) {
      this.$router.push({ name: routeName });
    }
  }
}