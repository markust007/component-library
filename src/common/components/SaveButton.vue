<template>
    <button @click="click()">Save</button>
</template>
<script>
export default {
  name: 'btn-save',
  data: () => ({

  }),
  methods: {
    click () {
      this.$emit('click');
    }
    }
}
</script>
