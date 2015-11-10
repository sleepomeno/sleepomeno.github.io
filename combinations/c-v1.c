#include <stdio.h>

int idx = 0;
/* puts all combinations into the array of its first argument */
void combinationsWithoutRepetition(int *combinations, int *feld,int bound,int length,int pos,int val){ 
  if(pos==length) {
    int i;
    for(i=0; i<length; i++) {
      combinations[idx++] = feld[i];
    }
  } else {
    int* feldPos = &feld[pos];
    int i;
    for(i=val;i<bound;++i){ 
      *feldPos=i; 
      combinationsWithoutRepetition(combinations,feld,bound,length,pos+1,i+1); 
    }
  }
} 
int main(int argc, char **argv) {
  int n=50;
  int k=5;
  int nrOfCombinations = 2118760; // assume that's correct for n=50,k=5
  int *combinations;
  combinations = malloc(nrOfCombinations*k*sizeof(int));

  int *singleCombination;
  singleCombination = malloc(k*sizeof(int));

  combinationsWithoutRepetition(combinations,singleCombination,n,k,0,0); 
  int i = 0;
  for (i=0; i < 50; i=i+5) {
    printf("%d %d %d %d %d \n", combinations[i],combinations[i+1],combinations[i+2],combinations[i+3],combinations[i+4]);
  }
}
