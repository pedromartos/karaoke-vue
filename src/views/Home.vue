<script setup lang="ts">
import { useMusicStore } from '@/store';
import { onMounted, reactive, ref, computed } from 'vue';
import { toast } from 'vue3-toastify';
import moment from 'moment';

interface Line {
  timestamp: number;
  words: string;
};

const song = 'runaway-sun_-_bad-bad-man.mp3';
const source = reactive({
  src: '',
  type: '',
});
const lyricsLoaded = ref(false);
const lyrics = ref();
const lyricsContainer = ref();
const player = ref();
const musicStore = useMusicStore();
let timer: any = null;
const progressInterval = 200

// GLOBAL STATE
const state = reactive({
  isPlaying: false,
  isDragging: false,
  currentTime: 0,
  duration: 0,
});

// Gets lyrics from .json file
const getLyrics = async () => {
  try {
    const { data } = await musicStore.getLyrics();
    lyrics.value = data.lyrics;
    lyricsLoaded.value = true;
  } catch (error: any) {
    toast.error('ERROR');
    console.error(error);
  }
};

// Callback event fired from <audio> everytime the time progresses
const updateTime = () => {
  if (player.value == null) {
    return;
  }

  state.currentTime = player.value.currentTime;

  // Scrolls the page to keep the active line centered
  const activeElement = document.querySelector('.lyrics .active') as HTMLElement;
  if (activeElement != undefined) {
    const top = activeElement.offsetTop - (lyricsContainer.value.offsetHeight / 2);
    lyricsContainer.value.scrollTo({ top: top, behavior: 'smooth' });
  }
};

// Button click
const toggle = async () => {
  if (state.isPlaying) {
    player.value.pause();
    state.isPlaying = false;
  } else {
    await player.value.play();
    state.isPlaying = true;

    if (state.duration == 0) {
      state.duration = player.value.duration;
      getLyrics();
    }
  }
};

// Format timestamp to human friendly time
const formatSeconds = (seconds: number) => {
  return moment.utc(seconds*1000).format('HH:mm:ss')
};

// Change Play/Pause button label
const btnLabel = computed(() => {
  return state.isPlaying ? 'Pause' : 'Play';
});

// Change Play/Pause Icon
const btnIcon = computed(() => {
  return state.isPlaying
  ? 'mdi-pause'
  : 'mdi-play';
});

const activeLine = ref(0);
const sync = 500

// Sets the line CSS class to read/active/next depending on player time
const lineStatus = (index: number ): string => {
  if (state.currentTime == 0 || activeLine.value < index ) {
    return 'wait';
  }

  const currentLine = lyrics.value[index];
  const nextLine = lyrics.value[index + 1];
  const classes = [];

  if (nextLine === undefined) {
    return 'active';
  }

  if (currentLine.timestamp - sync < state.currentTime*1000 && state.currentTime*1000 < nextLine.timestamp - sync) {
    activeLine.value = index + 1;
    classes.push('active');
  } else if (currentLine.timestamp < state.currentTime*1000 && index <= activeLine.value) {
    classes.push('read');
  } else {
    classes.push('next');
  }

  return classes.join(' ');
};

// Skip music to line that was clicked
const setTime = async (index: number) => {
  console.log('SET TIME', index);
  player.value.pause();
  await new Promise(resolve => {
    setTimeout(() => {
      activeLine.value = index + 1;
      player.value.currentTime = (lyrics.value[index].timestamp - sync) / 1000;
      resolve(true);
    }, 100);
  });

  player.value.play();
};

onMounted(() => {
  source.src = song;
  source.type = 'audio/mpeg';
  player.value.load();
  // player.value.currentTime = 15;
});

</script>

<template>
  <v-container class="d-flex flex-column align-center justify-center fill-height">

    <v-expand-transition>
      <div class="lyrics bg-deep-purple-darken-3 rounded-lg pa-4 mb-10" v-show="lyricsLoaded" ref="lyricsContainer">
        <div class="content d-flex flex-column align-center justify-center">
          <p
            v-for="(line, index) in lyrics"
            :key="line.timestamp"
            class="text-h6 text-left w-100 text-disabled mb-4"
            :class="lineStatus(index)"
            @click="setTime(index)"
          >
            {{ line.words }}
          </p>
        </div>
      </div>
    </v-expand-transition>

    <div class="player d-flex align-center justify-center flex-column">
      <v-btn color="deep-purple-accent-1" size="x-large" @click="toggle">
        {{ btnLabel }}

        <template v-slot:prepend>
          <v-icon>{{ btnIcon }}</v-icon>
        </template>
      </v-btn>

      <v-expand-transition>
        <p class="text-body-1 mt-2" v-show="lyricsLoaded">
          {{ formatSeconds(state.currentTime) }} / {{ formatSeconds(state.duration) }}
        </p>
      </v-expand-transition>

      <!-- ------------ -->
      <!-- AUDIO PLAYER -->
      <!-- ------------ -->
      <audio ref="player" @timeupdate="updateTime">
        <source :src="source.src" :type="source.type" />
      </audio>
    </div>
  </v-container>
</template>

<style lang="scss" scoped>
.lyrics {
  color: #fff;
  width: 100%;
  height: 75vh;
  overflow: auto;
  position: relative;

  p {
    cursor: pointer;
    transition: all ease-in-out 500ms;
    line-height: 1.2em;

    &.read {
      color: #fff!important;
    }
    &.active {
      color: #FFC107!important;
    }
  }
}

.player {
  /* flex: 1; */
}

</style>
